# backend/ml_engine.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def generate_ml_recommendations(user_preferences_str, games_data, num_recommendations=8):
    """
    user_preferences_str: e.g., "Action, Racing, singleplayer"
    games_data: List of game dictionaries fetched from RAWG
    num_recommendations: The number of matches to return (default is 8 for a clean 2x4 grid)
    """
    # Fallback if data is missing: return the first 8 games
    if not games_data or not user_preferences_str:
        return games_data[:num_recommendations]

    # 1. Prepare the data
    game_records = []
    for game in games_data:
        # Extract genres and tags into a single descriptive string
        genres = " ".join([g['name'] for g in game.get('genres', [])])
        tags = " ".join([t['name'] for t in game.get('tags', [])])
        features = f"{genres} {tags}".lower()
        
        game_records.append({
            'id': game['id'],
            'name': game['name'],
            'features': features,
            'original_data': game
        })

    # 2. Create a Pandas DataFrame
    df = pd.DataFrame(game_records)

    # 3. Add the user's profile as the "target" at the top of the dataset
    user_profile = {'id': 'USER', 'name': 'USER_PROFILE', 'features': user_preferences_str.replace(',', ' ').lower(), 'original_data': None}
    df = pd.concat([pd.DataFrame([user_profile]), df], ignore_index=True)

    # 4. Vectorize the text (Convert words into numerical matrices)
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['features'])

    # 5. Calculate Cosine Similarity
    # Compare the User Profile (index 0) against all games (index 1 to end)
    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # 6. Add scores to our dataframe and sort
    results_df = df.iloc[1:].copy()
    results_df['similarity'] = similarity_scores
    
    # Sort by highest similarity, then by RAWG rating as a tie-breaker
    results_df = results_df.sort_values(by='similarity', ascending=False)

    # 7. Return the top matches based on the num_recommendations parameter
    top_matches = results_df.head(num_recommendations)['original_data'].tolist()
    return top_matches
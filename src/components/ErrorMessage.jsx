export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg my-8 text-center max-w-2xl mx-auto">
      <h3 className="font-bold text-lg mb-1">Oops! Something went wrong.</h3>
      <p>{message}</p>
    </div>
  );
}
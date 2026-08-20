export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-800 dark:text-red-200 p-4 rounded-xl my-8 text-center max-w-2xl mx-auto shadow-sm">
      <h3 className="font-bold text-lg mb-1">Oops! Something went wrong.</h3>
      <p>{message}</p>
    </div>
  );
}
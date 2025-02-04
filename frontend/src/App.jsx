import BookCreatorForm from "./components/BookCreatorForm";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full bg-white shadow-md py-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800">Book Creator</h1>
          <p className="text-gray-600 mt-2">Create and customize your book with ease</p>
        </div>
      </div>
      <div className="flex justify-center items-center w-full py-8">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <BookCreatorForm />
        </div>
      </div>
    </div>
  );
}

export default App;

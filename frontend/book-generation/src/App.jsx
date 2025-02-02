import BookCreatorForm from './components/BookCreatorForm';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create a Book</h1>
      <BookCreatorForm />
    </div>
  );
}

export default App;
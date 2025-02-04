import { useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from './ui';
import './BookCreatorForm.css';

function BookCreatorForm() {
  const [formData, setFormData] = useState({
    title: "",
    coverImage: null,
    pageImages: [],
    texts: "",
    publisherLogo: null,
    publisherName: "",
    language: "english",
    leftMargin: false,
    textColor: "#000000",
    imageTextRatio: "",
    fontSize: 18,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pageImages" ? Array.from(files) : files[0],
    }));
  };

  const createBook = async () => {
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "texts") {
        formDataToSend.append(key, JSON.stringify(value.split("\n")));
      } else if (key === "pageImages") {
        value.forEach((file) => formDataToSend.append("pageImages", file));
      } else if (value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, String(value));
      }
    });

    try {
      const response = await fetch("http://localhost:3000/create-book", {
        method: "POST",
        body: formDataToSend,
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${formData.title || "book"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create a Book</h2>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <Label htmlFor="title">Title</Label>
          <Input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="coverImage">Cover Image</Label>
          <Input type="file" id="coverImage" name="coverImage" onChange={handleFileChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="pageImages">Page Images</Label>
          <Input type="file" id="pageImages" name="pageImages" multiple onChange={handleFileChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="texts">Page Texts</Label>
          <Textarea id="texts" name="texts" value={formData.texts} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="textColor">Text Color</Label>
          <Input type="color" id="textColor" name="textColor" value={formData.textColor} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="imageTextRatio">Image/Text Ratio (e.g., 80/20)</Label>
          <Input type="text" id="imageTextRatio" name="imageTextRatio" value={formData.imageTextRatio} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="fontSize">Font Size</Label>
          <Input type="number" id="fontSize" name="fontSize" value={formData.fontSize} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="publisherLogo">Publisher Logo</Label>
          <Input type="file" id="publisherLogo" name="publisherLogo" onChange={handleFileChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="publisherName">Publisher Name</Label>
          <Input type="text" id="publisherName" name="publisherName" value={formData.publisherName} onChange={handleInputChange} className="form-input" />
        </div>

        <div className="form-group">
          <Label htmlFor="language">Language</Label>
          <Select name="language" value={formData.language} onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="bengali">Bengali</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-group">
          <Checkbox id="leftMargin" name="leftMargin" checked={formData.leftMargin} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, leftMargin: checked }))} />
          <Label htmlFor="leftMargin">Left Margin</Label>
        </div>

        <Button type="button" onClick={createBook} className="submit-button">
          Create Book
        </Button>
      </form>
    </div>
  );
}

export default BookCreatorForm;

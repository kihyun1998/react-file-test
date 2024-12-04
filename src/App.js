// src/App.js
import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const handleBase64Upload = async () => {
    if (!selectedFile) {
      setError("파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = async () => {
        try {
          const response = await axios.post(
            "http://localhost:8080/upload/base64",
            {
              fileData: reader.result,
              filename: selectedFile.name,
            }
          );

          setUploadedFile(response.data.data);
          setLoading(false);
        } catch (error) {
          setError("업로드 중 오류가 발생했습니다.");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("파일 읽기 실패");
        setLoading(false);
      };
    } catch (error) {
      setError("업로드 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!uploadedFile) {
      setError("먼저 파일을 업로드해주세요.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/download/base64/${uploadedFile.fileType}/${uploadedFile.filename}`,
        { responseType: "blob" }
      );

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", uploadedFile.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>파일 업로드/다운로드 테스트</h1>

        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,video/*"
          />
          <button
            onClick={handleBase64Upload}
            disabled={loading || !selectedFile}
          >
            {loading ? "업로드 중..." : "Base64 업로드"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {uploadedFile && (
          <div className="result-section">
            <h3>업로드된 파일 정보:</h3>
            <p>파일명: {uploadedFile.filename}</p>
            <p>경로: {uploadedFile.path}</p>
            <p>타입: {uploadedFile.fileType}</p>
            <button onClick={handleDownload}>다운로드</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

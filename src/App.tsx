import { useState } from 'react';
import './App.css';
import dataRaw from '../data.json';

const data: Record<string, string> = dataRaw;

export const App = () => {
  const [input, setInput] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isValidInput = (value: string) => /^\d{6}$/.test(value);

  const handleSearch = () => {
    setError('');
    setImageSrc(null);

    if (!isValidInput(input)) {
      setError('6桁の数字を入力してください。');
      return;
    }

    // データからキーに対応する値を検索
    const imageFileName = data[input];
    console.log(imageFileName);

    if (!imageFileName) {
      setError('該当する画像が見つかりません。');
      return;
    }

    const imagePath = `/${imageFileName}.jpg`;
    setImageSrc(imagePath);
    // fetch(imagePath)
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error('該当する画像が見つかりません。');
    //     }
    //     setImageSrc(imagePath);
    //   })
    //   .catch(() => {
    //     setError('該当する画像が見つかりません。');
    //   });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>タキロン図面サーチ</h1>
        <div className="searchWrapper">
          <input
            className="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="6桁の数字を入力"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button className="button" onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="imageContainer">
        {error &&
          <div className="error">
            <p>
              {error}
            </p>
          </div>
        }
        {imageSrc && (
          <img
            src={imageSrc}
            alt="検索結果"
            className="result-image"
          />
        )}
      </div>
    </div>
  );
};
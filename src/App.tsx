"use client"

import { useState } from "react"
import "./App.css"
import dataRaw from "../data.json"
import { Search } from "lucide-react"

const data: Record<string, string> = dataRaw

export const App = () => {
  const [input, setInput] = useState("")
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [error, setError] = useState("")

  const isValidInput = (value: string) => /^\d{6}$/.test(value)

  const handleSearch = () => {
    setError("")
    setImageSrc(null)

    if (!isValidInput(input)) {
      setError("6桁の数字を入力してください。")
      return
    }

    // データからキーに対応する値を検索
    const imageFileName = data[input]

    if (!imageFileName) {
      setError("該当する画像が見つかりません。")
      return
    }

    const imagePath = `/${imageFileName}.jpg`
    setImageSrc(imagePath)
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerInnerWrapper">
          <div className="header-content">
            <div className="header-title">
              <h1>タキロン図面サーチ</h1>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  className="search-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="6桁のタキロンコードを入力"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <button className="search-button" onClick={handleSearch}>
                  <Search size={18} />
                  <span>検索</span>
                </button>
              </div>
            </div>
          </div>
          <div className="header-description">
            <p>タキロン製品の図面を商品コードから素早く検索できる便利ツール。設計や施工の効率をアップ！</p>
            <p className="disclaimer">
              ※全ての商品を網羅しているわけではございません。検証が不十分ですので参考程度にお使いください。
            </p>
          </div>
        </div>
      </header>

      <div className="content">
        <div className="imageContainer">
          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
          {imageSrc && <img src={imageSrc || "/placeholder.svg"} alt="検索結果" className="result-image" />}
        </div>
      </div>
    </div>
  )
}


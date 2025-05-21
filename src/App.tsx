"use client"

import { useState, useEffect, useRef } from "react";
import "./App.css"
import "./firebase-components.css"
import dataRaw from "../data.json"
import { Search, Upload, LogIn, LogOut, User as UserIcon } from "lucide-react"
import { auth, storage, db } from "./firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { Auth } from "./components/Auth"
import { ImageUploader } from "./components/ImageUploader"
import { Modal } from "./components/Modal"

const data: Record<string, string> = dataRaw

export const App = () => {
  const [input, setInput] = useState("")
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setIsUploadModalOpen(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const isValidInput = (value: string) => /^\d{6}$/.test(value);

  const handleSearch = async () => {
    setError("");
    setImageSrc(null);

    if (!isValidInput(input)) {
      setError("6桁の数字を入力してください。");
      return;
    }

    try {
      const docRef = doc(db, "parts", input);
      const docSnap = await getDoc(docRef);

      let fileName = "";
      if (docSnap.exists()) {
        fileName = docSnap.data().fileName?.trim() || "";
        if (docSnap.data().imageUrl) {
          setImageSrc(docSnap.data().imageUrl);
          return;
        }
      }

      if (!fileName) {
        fileName = data[input]?.trim() || "";
      }

      if (!fileName) {
        setError("該当する画像は登録されていません。");
        return;
      }

      const storagePath = `images/${fileName}.jpg`;

      try {
        const url = await getDownloadURL(ref(storage, storagePath));
        setImageSrc(url);
      } catch (storageErr) {
        console.error("Storageに画像がありません:", storagePath, storageErr);
        setError("画像がストレージに存在しません。");
      }
    } catch (err) {
      console.error("検索エラー:", err);
      setError("検索中に予期しないエラーが発生しました。もう一度お試しください。");
    }
  };

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
                  placeholder="6桁の製品コードを入力"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <button className="search-button" onClick={handleSearch} disabled={!input}>
                  <Search size={18} />
                  <span className="pc">検索</span>
                </button>
              </div>
            </div>
            <div className="admin-button-container">
              {user ? (
                <div className="user-menu">
                  <button
                    className="user-menu-button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    ref={buttonRef}
                  >
                    <UserIcon size={18} />
                    <span className="pc">{user.email?.split("@")[0]}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="user-menu-dropdown open" ref={menuRef}>
                      <button
                        className="user-menu-item"
                        onClick={() => {
                          setIsUploadModalOpen(true)
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <Upload size={16} style={{ marginRight: "8px" }} />
                        画像アップロード
                      </button>
                      <div className="user-menu-divider"></div>
                      <button
                        className="user-menu-item"
                        onClick={() => {
                          auth.signOut()
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <LogOut size={16} style={{ marginRight: "8px" }} />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="admin-button"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <LogIn size={18} />
                  <span className="pc">管理者ログイン</span>
                </button>
              )}
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
          {imageSrc && <img src={imageSrc} alt="検索結果" className="result-image" />}
        </div>
      </div>

      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="管理者ログイン"
      >
        <Auth user={user} setIsAuthModalOpen={setIsAuthModalOpen} />
      </Modal>

      <Modal
        isOpen={isUploadModalOpen && !!user}
        onClose={() => setIsUploadModalOpen(false)}
        title="図面アップロード"
      >
        {user && <ImageUploader user={user} />}
      </Modal>
    </div>
  )
}

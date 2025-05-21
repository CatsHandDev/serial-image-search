import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthProps {
  user: User | null;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}

export const Auth = ({ user, setIsAuthModalOpen }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, ] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(isLogin ? "ログインに失敗しました。" : "アカウント作成に失敗しました。");
        console.error(err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("ログアウトに失敗しました。", err);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <p>ログイン中: {user.email}</p>
        <button onClick={handleLogout} className="logout-button">
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? "ログイン" : "アカウント作成"}</h2>
      <form onSubmit={handleAuth} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button">
          {isLogin ? "ログイン" : "登録"}
        </button>
      </form>
      {/* <p className="auth-toggle">
        {isLogin ? "アカウントをお持ちでないですか？ " : "すでにアカウントをお持ちですか？ "}
        <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
          {isLogin ? "登録" : "ログイン"}
        </button>
      </p> */}
    </div>
  );
};


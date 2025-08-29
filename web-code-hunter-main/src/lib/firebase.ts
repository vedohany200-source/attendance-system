import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD20S2TQ97J5aaiDN-quXm1vct7JVlZbSw",
  authDomain: "pharmacy-d51c1.firebaseapp.com",
  databaseURL: "https://pharmacy-d51c1-default-rtdb.firebaseio.com",
  projectId: "pharmacy-d51c1",
  storageBucket: "pharmacy-d51c1.firebasestorage.app",
  messagingSenderId: "478057754762",
  appId: "1:478057754762:web:e38b251a1b5be67c233d73"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const doctors = {
  "RK36": { name: "دكتور رامي", isAdmin: true },
  "RA12": { name: "دكتوره روجينا", isAdmin: false },
  "KK00": { name: "دكتوره كاتي", isAdmin: false },
  "FH12": { name: "دكتور فادي", isAdmin: false },
  "FM90": { name: "فادي عماد", isAdmin: false },
  "YT56": { name: "يوسف ثروت", isAdmin: false },
  "GH78": { name: "جرجس هلال", isAdmin: false },
  "MH20": { name: "مارينا هاني", isAdmin: false }
};
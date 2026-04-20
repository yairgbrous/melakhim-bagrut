# מלכים - אתר תרגול לבגרות בתנ"ך

<div dir="rtl">

אתר תרגול אינטראקטיבי ללימוד ספר מלכים לבגרות בתנ"ך. מיועד לתלמידי תיכון ומורים, עם שאלות, ציטוטים, מבחני תרגול וטבלת מובילים.

## ✨ תכונות

- 🎯 **תרגול ממוקד** - שאלות מסווגות לפי פרקים ונושאים
- 📚 **מאגר ציטוטים** - ציטוטים מרכזיים מהספר עם הסברים
- 🏆 **טבלת מובילים** - פודיום שלושת הראשונים ורשימה מלאה
- 🔥 **רצף יומי** - מעקב רציפות תרגול לפי שעון ישראל
- 🌙 **מצב כהה** - תמיכה מלאה ב-Dark Mode
- 📱 **PWA** - ניתן להתקנה כאפליקציה במכשיר
- ♿ **נגישות** - תמיכה מלאה בקוראי מסך וניווט במקלדת
- 🌐 **Offline** - עובד גם ללא חיבור לאינטרנט

## 🚀 הפעלה מקומית

<div dir="ltr">

```bash
# Clone
git clone https://github.com/yairgbrous/melakhim-bagrut.git
cd melakhim-bagrut

# Serve (any static server works)
python3 -m http.server 8000
# or
npx serve .
```

</div>

פתח דפדפן בכתובת `http://localhost:8000`.

## 📂 מבנה הפרויקט

<div dir="ltr">

```
melakhim-bagrut/
├── index.html              # האפליקציה הראשית (SPA)
├── share.html              # עמוד נחיתה לשיתוף בוואטסאפ
├── manifest.json           # מניפסט PWA
├── sw.js                   # Service Worker (offline)
├── robots.txt              # הנחיות למנועי חיפוש
├── sitemap.xml             # מפת אתר ל-SEO
├── assets/
│   └── quote-cards.css    # עיצוב כרטיסי ציטוטים
└── .github/workflows/
    └── deploy.yml          # CI/CD ל-GitHub Pages
```

</div>

## 🛠️ טכנולוגיות

- **HTML5 + CSS3 + JavaScript** - ללא תלויות בחוץ
- **PWA** - Service Worker + Web App Manifest
- **RTL** - תמיכה מלאה בעברית
- **GitHub Pages** - אחסון סטטי חינמי

## 🤝 תרומה

תרומות יתקבלו בברכה. פתחו Issue או Pull Request.

1. Fork את המאגר
2. צרו branch חדש (`git checkout -b feature/amazing`)
3. Commit עם הודעה ברורה
4. Push ל-branch (`git push origin feature/amazing`)
5. פתחו Pull Request

## 📄 רישיון

MIT License - ראו קובץ LICENSE לפרטים.

## 🙏 תודות

- למורים ולתלמידים שתרמו שאלות ומשוב
- לקהילת הקוד הפתוח

---

<p align="center">נבנה באהבה ללימוד התנ"ך 📖</p>

</div>

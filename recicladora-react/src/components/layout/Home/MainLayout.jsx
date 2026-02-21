import Header from "./Header.jsx";

function MainLayout({ children }) {
  return (
    <div className="layout d-flex flex-column min-vh-100">
      <Header />
      <main className="layout__main flex-fill">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;

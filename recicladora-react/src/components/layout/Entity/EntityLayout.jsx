import "./EntityLayout.css";

const EntityLayout = ({
                          title,
                          onSearch,
                          searchTerm,
                          onAddClick,
                          addBtnText,
                          children
                      }) => {
    return (
        <div className="entity-layout d-flex justify-content-center align-items-stretch bg-light">
            <div className="entity-layout__container bg-white p-4 rounded shadow w-100" style={{ maxWidth: "1200px" }}>

                <h3 className="entity-layout__title mb-4 text-center text-success fw-bold">
                    {title}
                </h3>

                <div className="entity-layout__header row mb-3 g-3">
                    <div className="col-md-6 col-lg-5">
                        <div className="search-wrapper">
                            <i className="bi bi-search search-icon"></i>
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Buscar categorías..."
                                value={searchTerm}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 ms-auto">
                        <button
                            className="btn btn-success btn-add w-100"
                            onClick={onAddClick}
                        >
                            <i className="bi bi-plus-circle me-2"></i>{addBtnText}
                        </button>
                    </div>
                </div>

                <div className="entity-layout__body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default EntityLayout;
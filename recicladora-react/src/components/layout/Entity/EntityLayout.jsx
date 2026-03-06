import "./EntityLayout.css";

const EntityLayout = ({
                          title,
                          onSearch,
                          searchTerm,
                          onAddClick,
                          addBtnText,
                          children,
                          hideTitle = false,
                          headerIcon,
                          hideControls = false,
                          bodyScroll = false,
                          bodyMaxHeight,
                      }) => {
    return (
        <div className="entity-layout bg-light" >
            {/* Este es el contenedor de la tarjeta blanca */}
            <div className="entity-layout__container bg-white shadow-sm">

                {!hideTitle && (
                    <div className="entity-layout__header-title d-flex align-items-center px-4 pt-4">
                        <div className="entity-layout__title-icon-container me-3">
                            {headerIcon ? (
                                typeof headerIcon === "string" ? (
                                    <img
                                        src={headerIcon}
                                        alt="icon"
                                        className="entity-layout__custom-icon"
                                    />
                                ) : (
                                    headerIcon
                                )
                            ) : (
                                <i className="bi bi-recycle fs-2 text-success"></i>
                            )}
                        </div>
                        <h3 className="entity-layout__title text-success fw-bold m-0">
                            {title}
                        </h3>
                    </div>
                )}

                {/* Controles de búsqueda y botón */}
                {!hideControls && (
                    <div className="entity-layout__controls">
                        <div className="container-fluid px-0">
                            <div className="row g-3 align-items-center">
                                <div className="col-12 col-md-6 col-lg-5">
                                    <div className="search-wrapper">
                                        <i className="bi bi-search search-icon"></i>
                                        <input
                                            type="text"
                                            className="form-control search-input"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => onSearch?.(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3 ms-auto">
                                    <button
                                        className="btn btn-success btn-add w-100"
                                        onClick={onAddClick}
                                        disabled={!onAddClick}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>{addBtnText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido (Tabla) */}
                <div
                    className={`entity-layout__body ${bodyScroll ? "entity-layout__body--scroll" : ""}`}
                    style={bodyMaxHeight ? { maxHeight: bodyMaxHeight } : undefined}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default EntityLayout;
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Autocomplete simple (sin librerías) para seleccionar materiales.
 */
export default function MaterialAutocomplete({
                                                 items = [],
                                                 value = "",
                                                 onChange,
                                                 onSelect,
                                                 placeholder = "Buscar material",
                                                 disabled = false,
                                                 maxResults = 10,
                                                 getSubLabel,
                                                 getBadge,
                                                 isItemDisabled,
                                             }) {

    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const safeItems = Array.isArray(items) ? items : [];

    const results = useMemo(() => {

        const q = String(value || "").trim().toLowerCase();

        if (!q) return safeItems.slice(0, maxResults);

        return safeItems
            .filter((m) => {
                const name = String(m?.materialName || "").toLowerCase();
                const code = String(m?.code || "").toLowerCase();

                return name.includes(q) || code.includes(q);
            })
            .slice(0, maxResults);

    }, [safeItems, value, maxResults]);

    useEffect(() => {

        const handleClickOutside = (e) => {
            if (!rootRef.current) return;

            if (!rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    const handleKeyDown = (e) => {

        if (e.key === "Escape") {
            setOpen(false);
        }

    };

    const handleSelect = (item) => {

        if (isItemDisabled?.(item)) return;

        onSelect?.(item);

        setOpen(false);

    };

    return (
        <div ref={rootRef} className="position-relative">

            <input
                type="text"
                className="form-control"
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                onChange={(e) => {
                    onChange?.(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
            />

            {open && !disabled && results.length > 0 && (

                <div
                    className="dropdown-menu show w-100"
                    style={{
                        maxHeight: "260px",
                        overflowY: "auto"
                    }}
                >

                    {results.map((m) => {

                        const sub = getSubLabel?.(m);
                        const badge = getBadge?.(m);
                        const itemDisabled = Boolean(isItemDisabled?.(m));

                        return (

                            <button
                                key={m.id}
                                type="button"
                                className={`dropdown-item ${itemDisabled ? "disabled" : ""}`}
                                onClick={() => handleSelect(m)}
                            >

                                <div className="d-flex justify-content-between align-items-center">

                                    <span>{m.materialName}</span>

                                    <div className="d-flex align-items-center gap-2">
                                        {badge}
                                        <small className="text-muted">{m.code}</small>
                                    </div>

                                </div>

                                {sub && (
                                    <div>
                                        <small className="text-muted">
                                            {sub}
                                        </small>
                                    </div>
                                )}

                            </button>

                        );

                    })}

                </div>

            )}

        </div>
    );
}

MaterialAutocomplete.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            materialName: PropTypes.string,
            code: PropTypes.string,
        })
    ),
    value: PropTypes.string,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    maxResults: PropTypes.number,
    getSubLabel: PropTypes.func,
    getBadge: PropTypes.func,
    isItemDisabled: PropTypes.func,
};
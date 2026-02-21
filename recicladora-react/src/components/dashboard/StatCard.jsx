import "./StatCard.css";

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card card text-center shadow-sm">
      <div className="stat-card__body card-body">
        <i className={`bi ${icon} stat-card__icon`}></i>
        <h5 className="stat-card__title mt-2">{title}</h5>
        <h2 className="stat-card__value">{value}</h2>
      </div>
    </div>
  );
}

export default StatCard;

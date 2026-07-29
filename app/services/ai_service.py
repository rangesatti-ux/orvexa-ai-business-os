from sqlalchemy import func

from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.payroll import Payroll


def generate_ai_insights(db):

    insights = []

    revenue = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0)
    ).scalar()

    purchases = db.query(
        func.coalesce(func.sum(Purchase.grand_total), 0)
    ).scalar()

    payroll = db.query(
        func.coalesce(func.sum(Payroll.net_salary), 0)
    ).scalar()

    low_stock = db.query(Product).filter(
        Product.quantity < 10
    ).count()

    profit = revenue - purchases - payroll

    if revenue > purchases:
        insights.append(
            "Revenue is higher than purchase expenses."
        )

    if low_stock > 0:
        insights.append(
            f"{low_stock} products need immediate restocking."
        )

    if payroll > revenue * 0.30:
        insights.append(
            "Payroll expenses exceed 30% of revenue."
        )

    if profit > 0:
        insights.append(
            f"Estimated profit is ₹{profit:,.2f}."
        )
    else:
        insights.append(
            "Business is currently operating at a loss."
        )

    return insights
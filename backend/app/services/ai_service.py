from openai import OpenAI
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.payroll import Payroll


def generate_ai_insights(db: Session):
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
            f"Estimated profit is ?{profit:,.2f}."
        )
    else:
        insights.append(
            "Business is currently operating at a loss."
        )

    return insights


def generate_ai_response(
    db: Session,
    user_message: str,
) -> str:

    if not settings.GROQ_API_KEY:
        return (
            "AI service is not configured yet. "
            "Please add GROQ_API_KEY to the environment."
        )

    revenue = db.query(
        func.coalesce(func.sum(Sale.grand_total), 0)
    ).scalar()

    purchases = db.query(
        func.coalesce(func.sum(Purchase.grand_total), 0)
    ).scalar()

    payroll = db.query(
        func.coalesce(func.sum(Payroll.net_salary), 0)
    ).scalar()

    product_count = db.query(Product).count()

    low_stock_products = db.query(Product).filter(
        Product.quantity < 10
    ).all()

    low_stock_text = ", ".join(
        f"{product.product_name} ({product.quantity})"
        for product in low_stock_products
    )

    profit = revenue - purchases - payroll

    business_context = f"""
You are Orvexa AI, an intelligent business assistant.

You help the user understand their business using the
business data provided by the Orvexa Business OS.

IMPORTANT RULES:
- Use the provided business data when answering business questions.
- Do not invent financial numbers.
- Do not claim access to data that is not provided.
- If the available data is insufficient, clearly say so.
- Give concise, practical answers.
- Format financial values in Indian Rupees (?).

CURRENT BUSINESS DATA:

Total revenue: ?{revenue:,.2f}
Total purchases: ?{purchases:,.2f}
Total payroll expense: ?{payroll:,.2f}
Estimated profit: ?{profit:,.2f}
Total products: {product_count}

Low-stock products:
{low_stock_text or "None"}

USER QUESTION:
{user_message}
"""

    try:
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Orvexa AI, a helpful business "
                        "assistant for a business management system."
                    ),
                },
                {
                    "role": "user",
                    "content": business_context,
                },
            ],
            temperature=0.3,
            max_tokens=500,
        )

        return response.choices[0].message.content

    except Exception as exc:
        print(
            f"GROQ ERROR: {type(exc).__name__}: {exc}"
        )

        return (
            "I couldn't process your request right now. "
            "Please try again."
        )

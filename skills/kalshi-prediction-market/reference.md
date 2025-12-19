# Calci Prediction Market Reference (Kalshi)

This reference expands on SKILL.md with more complete domain context.

## What Kalshi Is

Kalshi is a CFTC‑regulated U.S. prediction‑market exchange. Users trade **binary event contracts** about real‑world outcomes. Contracts settle at **$1 (Yes)** or **$0 (No)**. Prices move between $0.01 and $0.99 and can be read as probabilities.

Key properties:

- **Regulated exchange** (Designated Contract Market).  
- **Nationwide U.S. legality** via commodities regulation.  
- **KYC/AML** required for all users.  
- **Full collateralization**: no leverage or margin.

## Market Categories

Kalshi lists markets across economics, politics/policy, weather/climate, some sports/entertainment, and other real‑world indicators. Each series is reviewed for compliance before launch.

## Series → Events → Markets

- **Series**: recurring template with shared rules and settlement sources.  
  - Example: CPI inflation releases, weekly jobless claims, daily rainfall.  
- **Event**: one instance inside a series, often date‑keyed.  
  - Example: “CPI for October 2025.”  
- **Market**: one binary outcome contract inside an event.  
  - Example: “CPI ≥ 3% YoY (Yes/No).”

Events may be **single‑market** or **multi‑market**. Multi‑market events may be **mutually exclusive**, meaning only one market outcome can resolve Yes.

## Pricing and Order Books

Each market has linked Yes/No order books. Public fields:

- **yes_bid / yes_ask**: best prices to buy/sell Yes.  
- **no_bid / no_ask**: best prices to buy/sell No.  
- **last_price**: last Yes trade.  
- **spread**: difference between best bid and ask; often 1–2¢ in liquid markets.

Trading rules:

- Buying Yes at price `P` costs `P` dollars per contract.  
- Buying No is equivalent to selling Yes; effective cost ~`1 − P`.  
- Closing a position is done by taking the opposite side later.

## Fees

Kalshi uses a **variable (quadratic) fee** based on potential profit. Average fees are typically under ~2% of trade value. Resting limit orders that add liquidity may have reduced or zero fees.

## Settlement

Each series includes:

- **contract_terms_url**  
- **settlement_sources** (official URLs)  
- **rules_primary / rules_secondary**

Markets close at `close_time`, then settle once official data confirms the result. After settlement, `result` is set to `yes` or `no`, and winners receive $1 per contract.

Some markets support early settlement if the outcome becomes certain.

## Risk Controls

Because Kalshi is regulated:

- **Position limits** may apply (`risk_limit_cents`).  
- Some markets include **additional_prohibitions** for insider‑risk cases.  
- Monitoring exists for manipulation/insider trading.

## API Basics

### Public REST endpoints

- `GET /series`, `GET /events`, `GET /markets`  
- `GET /market/{ticker}`  
- `GET /market/orderbook`  
- `GET /market/candlesticks`, `GET /market/trades`  
- `GET /exchange/status`

Orderbook responses contain **Yes bids** and **No bids** arrays of `[price, quantity]`.

### Private REST endpoints

- `POST /orders` (limit orders)  
- `DELETE /orders/{id}` / batch cancels  
- `POST /order-groups` (OCO/filled‑limit coordination)  
- `GET /portfolio/balance`, `GET /portfolio/positions`, `GET /portfolio/fills`

### Authentication

Requests to private endpoints require an API key id and RSA signature:

- `KALSHI-ACCESS-KEY`  
- `KALSHI-ACCESS-TIMESTAMP`  
- `KALSHI-ACCESS-SIGNATURE`

### Streaming

Kalshi provides:

- **WebSocket** for live price/orderbook/trade updates.  
- **FIX** gateway for low‑latency institutional trading.

## Comparisons (High Level)

- **Polymarket**: crypto‑native AMM/orderbook hybrid, historically unregulated for U.S. users; trades in USDC.  
- **PredictIt**: legacy political market with strict caps; no‑action relief revoked.  
- **Betting exchanges**: similar mechanics but regulated as gambling outside the U.S.

Kalshi’s differentiator is regulated USD‑cleared, order‑book‑based prediction markets.


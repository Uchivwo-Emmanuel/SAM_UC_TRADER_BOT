# Backend recovery runbook

## Broker or market-data outage

Pause new entries, retain existing broker-side protective orders, write an audit event, and alert both owners. Do not reopen entries automatically after reconnect; require a healthy stream check.

## Kill switch

Block new entries immediately. Attempt protective closure of open positions using the configured retry policy, audit every attempt, and alert both owners.

## Worker failure

Mark worker health unhealthy, alert owners, preserve the failure correlation ID, and restart only after the failure cause is identified.

## Database failure

Stop new entries and report a critical health failure. Do not operate with missing audit or risk records.

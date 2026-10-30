# Stock Flow — C++17

FEFO allocation with duplicate-ID, quantity and calendar-date validation. Same-day and older expiry dates are excluded. Synthetic inventory only; not medication-use advice.

```sh
g++ -std=c++17 -O2 stock_flow.cpp -o stock_flow
./stock_flow lots.csv 2026-10-30 65
```

Expected allocation: LOT-B 25, LOT-D 30, LOT-A 10; LOT-C excluded; shortage 0. Input inventory is not modified. A compiler was unavailable on the authoring machine; this native source is supplied for review/build, not represented as a compiled binary. The browser demonstration uses a separately tested JavaScript engine.

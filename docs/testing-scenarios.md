# KAIRO — Testing Scenarios & Demo Examples

> Use these realistic field testing scenarios to test KAIRO's real-time voice conversation, Moss low-latency semantic retrieval (<10ms target), and grounded AI responses.

---

## 🛠️ Scenario 1: Primary Equipment Error Diagnostic (Error E17)

**Field Context**: Field technician is standing in front of Hydraulic Feed Pump P-204 at Site 12.

### 🎙️ Spoken Voice Prompts:
- *"KAIRO, I'm at Site 12. Pump P-204 is showing error E17. What should I check first?"*
- *"What is the cause of error E17 on Pump P-204?"*

### ⚡ Expected Moss Retrieval Results (Latency ~3.21 ms):
- **Error Code**: `E17` — Pressure Sensor Signal Anomaly / Out of Range
- **Equipment Spec**: `P-204` — High-Pressure Hydraulic Feed Pump (Model XJ-400, Substation B, Bay 4)
- **Safety Procedure**: `ISO-S12-04` — Site 12 Electrical & Hydraulic Isolation Procedure
- **Maintenance History**: `MR-2026-8841` — Pressure sensor inspection 18 days ago

### 🗣️ Expected KAIRO Spoken Response:
> *"Pump P-204 uses the XJ-400 control system. Error E17 indicates a pressure sensor signal anomaly where feedback deviated by more than 15%. First, verify the sensor wiring harness and compare the reading against analog gauge PI-204. Before opening the panel, follow Site 12 isolation procedure ISO-S12-04."*

---

## 🛠️ Scenario 2: Equipment Maintenance History Query

**Field Context**: Technician wants to verify recent repairs before replacing parts.

### 🎙️ Spoken Voice Prompts:
- *"When was the pressure sensor on Pump P-204 last serviced and what was done?"*
- *"Show me recent maintenance records for Site 12 Pump P-204."*

### ⚡ Expected Moss Retrieval Results:
- **Record ID**: `MR-2026-8841` (Aug 24, 2026)
- **Technician**: Sarah Jenkins
- **Action**: Terminal cleaning and zero-point recalibration to 0.00 bar

### 🗣️ Expected KAIRO Spoken Response:
> *"The pressure sensor on Pump P-204 was last serviced 18 days ago on August 24th by Sarah Jenkins. Minor oxidation was cleaned on the terminal block and zero-point calibration passed QA."*

---

## 🛠️ Scenario 3: Safety Isolation & PPE Guidance

**Field Context**: Technician needs mandatory lock-out/tag-out rules before performing physical maintenance.

### 🎙️ Spoken Voice Prompts:
- *"What safety procedure and PPE do I need before opening the electrical panel on Pump P-204?"*
- *"How do I isolate electrical and hydraulic power at Site 12?"*

### ⚡ Expected Moss Retrieval Results:
- **Safety Procedure**: `ISO-S12-04`
- **Mandatory PPE**: Arc-flash face shield, Class 0 insulated gloves, Steel-toe boots
- **Key Steps**: Disconnect 415V breaker CB-204, apply LOTO lock, bleed hydraulic manifold via valve BV-01

### 🗣️ Expected KAIRO Spoken Response:
> *"Before opening the panel, follow isolation procedure ISO-S12-04. Disconnect 415V breaker CB-204 at Substation B, apply your LOTO padlock, and bleed hydraulic manifold pressure via valve BV-01. Mandatory PPE includes an arc-flash face shield and Class 0 insulated gloves."*

---

## 🛠️ Scenario 4: Technical Specifications & Operating Thresholds

**Field Context**: Technician wants operating pressure tolerances and flow rates.

### 🎙️ Spoken Voice Prompts:
- *"What is the operating pressure range and flow rate for Pump P-204?"*
- *"What are the specifications for model XJ-400?"*

### ⚡ Expected Moss Retrieval Results:
- **Operating Pressure**: 4.5 to 8.0 bar
- **Flow Rate**: 450 L/min
- **Power Rating**: 75 kW

### 🗣️ Expected KAIRO Spoken Response:
> *"Pump P-204 has a normal operating pressure range of 4.5 to 8.0 bar with a rated flow rate of 450 liters per minute and a 75 kilowatt drive rating."*

---

## 🛠️ Scenario 5: Thermal Overload Warning (Error E04)

**Field Context**: Pump motor casing feels hot.

### 🎙️ Spoken Voice Prompts:
- *"Pump P-204 is showing error E04 thermal overload. What should I inspect?"*

### ⚡ Expected Moss Retrieval Results:
- **Error Code**: `E04` — Thermal Overload Warning (Winding temp >85°C)
- **Probable Causes**: Cooling fan blockage, high ambient temperature, mechanical overload

### 🗣️ Expected KAIRO Spoken Response:
> *"Error E04 indicates drive motor winding temperature exceeded 85°C. Check the cooling fan cowl for debris, inspect ventilation intake filters, and measure phase currents using a clamp meter."*

---

## 💡 Quick Tips for Demo Setup
1. Open **http://localhost:3000** in your browser.
2. Click **"Ready to Connect"** to join the live room.
3. Speak any of the prompts above or click the quick demo buttons on the UI.
4. Observe the **Moss Latency Badge** showing **~3.21 ms** retrieval speed!

# SIH25001 APP

## Onboarding

1. Enter name, mobile, OTP
2. Store home location
3. List nearest water sources
4. Tick the ones to add to watchlist

## Scaffold

- App name (center)
- Settings button (corner)


## Bottom navigation

- Home
- Search
- Map
- Report


# Home

## Header

- Show online/offline and last sync


## Watchlist

- Horizontal cards
- List water bodies: name + status (red/yellow/green)
- Edit → go to Search


## Alerts

- Vertical cards
- Item: title, summary, date


# Search

- Search box
- List results as vertical items
- Sort by distance from current location
- On click item → expand with chips: status card, add to watchlist, more details


# Map

- Google Map view with current location
- Water bodies overlaid with status colors
- On click: show popup with name, status, and “More details” button


# Report

- Title end: History button → list previously reported

1) Select symptoms

- Predefined chips with icons + “Other”
- Allow selecting multiple

2) Input mode selection (button group)

- Write details (default)
- Speak: on click, expand to show mic button; press and hold to talk; convert speech to text; fill textbox

3) Textbox
4) Submit

# Other screens

## Water body details

- Title, risk level
- Address, Map button
- Last updated timestamp
- Individual parameter cards (pH, TDS, Turbidity, O2)
- Alerts list (title, summary, date)


## Previously reported incident

- Date, time, symptom
- Status (Open/Closed)
- Action taken (authority, timestamp)
- Add follow-up (if Open): text/voice


## Settings

- Name
- Phone number
- Home location
- Notifications (toggle)
- Logout
- Delete account


# Extras

- Notifications: FCM service


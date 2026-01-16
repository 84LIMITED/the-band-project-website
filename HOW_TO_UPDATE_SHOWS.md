# How to Update Shows (Dates and Locations)

## Quick Guide

Shows are stored in `/content/shows.json`. Edit this file to add, update, or remove shows.

## File Location

```
/content/shows.json
```

## Show Data Format

Each show entry follows this structure:

```json
{
  "id": "show-1",
  "date": "2024-06-15",
  "venue": "The Grand Theater",
  "city": "Los Angeles",
  "state": "CA",
  "time": "8:00 PM",
  "doors": "7:00 PM",
  "ticketUrl": "https://example.com/tickets/show-1",
  "isUpcoming": true
}
```

## Field Descriptions

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `id` | Yes | Unique string | `"show-1"` |
| `date` | Yes | YYYY-MM-DD | `"2024-06-15"` |
| `venue` | Yes | String | `"The Grand Theater"` |
| `city` | Yes | String | `"Los Angeles"` |
| `state` | Yes | 2-letter code | `"CA"` |
| `time` | Optional | Time string | `"8:00 PM"` |
| `doors` | Optional | Time string | `"7:00 PM"` |
| `ticketUrl` | Optional | URL | `"https://example.com/tickets"` |
| `isUpcoming` | Yes | Boolean | `true` or `false` |

## How to Update

### 1. Edit the JSON File

Open `/content/shows.json` in your code editor.

### 2. Update Existing Show

Change any field values:

```json
{
  "id": "show-1",
  "date": "2024-07-20",  // ← Updated date
  "venue": "New Venue Name",  // ← Updated venue
  "city": "San Francisco",  // ← Updated city
  "state": "CA",
  "time": "9:00 PM",
  "doors": "8:00 PM",
  "isUpcoming": true
}
```

### 3. Add New Show

Add a new object to the array:

```json
[
  {
    "id": "show-1",
    "date": "2024-06-15",
    "venue": "The Grand Theater",
    "city": "Los Angeles",
    "state": "CA",
    "time": "8:00 PM",
    "doors": "7:00 PM",
    "isUpcoming": true
  },
  {
    "id": "show-4",  // ← New show
    "date": "2024-09-15",
    "venue": "Red Rocks Amphitheatre",
    "city": "Morrison",
    "state": "CO",
    "time": "7:30 PM",
    "doors": "6:30 PM",
    "isUpcoming": true
  }
]
```

### 4. Remove a Show

Either:
- Set `"isUpcoming": false` (keeps it in data but hides it)
- Delete the entire object from the array

### 5. Mark Show as Past

Set `"isUpcoming": false`:

```json
{
  "id": "show-1",
  "date": "2024-06-15",
  "venue": "The Grand Theater",
  "city": "Los Angeles",
  "state": "CA",
  "isUpcoming": false  // ← Will not appear in upcoming shows
}
```

## Date Format

**Important:** Always use `YYYY-MM-DD` format:
- ✅ Correct: `"2024-06-15"`
- ❌ Wrong: `"06/15/2024"` or `"June 15, 2024"`

## Time Format

Use 12-hour format with AM/PM:
- ✅ Correct: `"8:00 PM"`, `"9:30 PM"`, `"7:00 AM"`
- ❌ Wrong: `"20:00"` or `"8pm"`

## Examples

### Example 1: Simple Show

```json
{
  "id": "show-5",
  "date": "2024-10-31",
  "venue": "The Roxy",
  "city": "Los Angeles",
  "state": "CA",
  "isUpcoming": true
}
```

### Example 2: Show with All Details

```json
{
  "id": "show-6",
  "date": "2024-11-15",
  "venue": "Blue Note Jazz Club",
  "city": "New York",
  "state": "NY",
  "time": "9:00 PM",
  "doors": "8:00 PM",
  "ticketUrl": "https://bluenote.net/tickets/show-6",
  "isUpcoming": true
}
```

## After Updating

1. **Save the file** (`/content/shows.json`)
2. **Restart dev server** if running locally:
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```
3. **Refresh browser** to see changes

## Production (AWS DynamoDB)

In production, shows are stored in DynamoDB. To update:
1. Use AWS Console → DynamoDB
2. Navigate to `the-band-project-shows` table
3. Add/edit items with the same structure
4. Changes appear immediately (no restart needed)

## Tips

- Keep `id` values unique
- Use consistent date format (YYYY-MM-DD)
- Set `isUpcoming: false` for past shows (don't delete them)
- The site automatically sorts shows by date (upcoming first)

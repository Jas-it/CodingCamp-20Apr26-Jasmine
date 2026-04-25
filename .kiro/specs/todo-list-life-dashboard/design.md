# Design Document: To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a single-page web application (SPA) built entirely with client-side technologies. The application provides a personal productivity interface combining time awareness, focus management, task tracking, and quick website access. All data persists in the browser's Local Storage, eliminating the need for backend infrastructure or user authentication.

### Key Design Principles

1. **Client-Side Only**: No server-side logic or API calls; all functionality runs in the browser
2. **Local Storage First**: All user data persists in browser Local Storage with immediate synchronization
3. **Reactive UI**: Interface updates automatically in response to state changes
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
5. **Minimal Dependencies**: Prefer vanilla JavaScript or lightweight libraries to keep bundle size under 500 KB

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Styling with CSS Grid/Flexbox for layout
- **JavaScript (ES6+)**: Application logic and DOM manipulation
- **Local Storage API**: Client-side data persistence
- **No Framework Required**: Vanilla JS is sufficient, or optionally React/Vue for component structure

## Architecture

### High-Level Architecture

The application follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     Dashboard (Root)                     │
│  - Initializes all components                           │
│  - Manages global state                                 │
│  - Coordinates Local Storage operations                 │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Greeting   │    │ Focus Timer  │    │  Task List   │
│   Display    │    │  Component   │    │  Component   │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │ Quick Links  │
                                        │  Component   │
                                        └──────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Local Storage API   │
                │  - tasks              │
                │  - quickLinks         │
                └───────────────────────┘
```

### Component Architecture

Each component is responsible for:
1. **Rendering**: Generating and updating its DOM representation
2. **State Management**: Managing its internal state
3. **Event Handling**: Responding to user interactions
4. **Persistence**: Reading from and writing to Local Storage

### Data Flow

1. **Initialization**: Dashboard loads → Components read from Local Storage → Render initial state
2. **User Interaction**: User action → Component updates state → Update Local Storage → Re-render
3. **Time Updates**: setInterval triggers → Update time display → Check for greeting changes

## Components and Interfaces

### 1. Greeting Display Component

**Responsibility**: Display current time, date, and time-based greeting

**State**:
```javascript
{
  currentTime: Date,
  greeting: string  // "Good morning" | "Good afternoon" | "Good evening" | "Good night"
}
```

**Interface**:
```javascript
class GreetingDisplay {
  constructor(containerElement)
  
  // Updates time and greeting, called every second
  update(): void
  
  // Determines greeting based on current hour
  getGreeting(hour: number): string
  
  // Formats time as "h:mm:ss AM/PM"
  formatTime(date: Date): string
  
  // Formats date as "DayOfWeek, Month Day"
  formatDate(date: Date): string
  
  // Renders the component
  render(): void
}
```

**Key Methods**:
- `getGreeting(hour)`: Returns greeting string based on hour (5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night)
- `update()`: Called every 1000ms via setInterval to refresh display
- `formatTime()`: Converts Date to 12-hour format with AM/PM
- `formatDate()`: Converts Date to human-readable format

### 2. Focus Timer Component

**Responsibility**: Provide a 25-minute countdown timer with start/stop/reset controls

**State**:
```javascript
{
  totalSeconds: number,      // Always 1500 (25 minutes)
  remainingSeconds: number,  // Current countdown value
  isRunning: boolean,        // Timer active state
  intervalId: number | null  // setInterval reference
}
```

**Interface**:
```javascript
class FocusTimer {
  constructor(containerElement)
  
  // Start countdown from current remainingSeconds
  start(): void
  
  // Pause countdown
  stop(): void
  
  // Reset to 25 minutes (1500 seconds)
  reset(): void
  
  // Decrement remainingSeconds by 1, called every second when running
  tick(): void
  
  // Format seconds as "MM:SS"
  formatTime(seconds: number): string
  
  // Renders the component
  render(): void
}
```

**Key Methods**:
- `start()`: Creates setInterval that calls `tick()` every 1000ms
- `stop()`: Clears interval, preserves remainingSeconds
- `reset()`: Sets remainingSeconds to 1500, stops timer
- `tick()`: Decrements remainingSeconds, stops at 0
- `formatTime()`: Converts seconds to MM:SS format (e.g., 1500 → "25:00")

### 3. Task List Component

**Responsibility**: Manage task CRUD operations and persistence

**State**:
```javascript
{
  tasks: Task[],
  editingTaskId: string | null
}

interface Task {
  id: string,           // UUID or timestamp-based unique ID
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Timestamp for ordering
}
```

**Interface**:
```javascript
class TaskList {
  constructor(containerElement)
  
  // Load tasks from Local Storage
  loadTasks(): Task[]
  
  // Save tasks to Local Storage
  saveTasks(): void
  
  // Create new task with given text
  addTask(text: string): void
  
  // Toggle task completion status
  toggleTask(taskId: string): void
  
  // Update task text
  editTask(taskId: string, newText: string): void
  
  // Remove task
  deleteTask(taskId: string): void
  
  // Generate unique task ID
  generateId(): string
  
  // Renders the component
  render(): void
}
```

**Key Methods**:
- `loadTasks()`: Reads from `localStorage.getItem('tasks')`, parses JSON, returns array
- `saveTasks()`: Writes `this.tasks` to `localStorage.setItem('tasks', JSON.stringify(tasks))`
- `addTask()`: Creates Task object, adds to array, calls saveTasks(), re-renders
- `toggleTask()`: Finds task by ID, flips completed boolean, saves, re-renders
- `editTask()`: Finds task by ID, updates text, saves, re-renders
- `deleteTask()`: Filters out task by ID, saves, re-renders
- `generateId()`: Returns `Date.now().toString() + Math.random()` or UUID

### 4. Quick Links Component

**Responsibility**: Manage quick link CRUD operations and navigation

**State**:
```javascript
{
  links: QuickLink[]
}

interface QuickLink {
  id: string,    // Unique identifier
  label: string, // Display text
  url: string    // Target URL
}
```

**Interface**:
```javascript
class QuickLinks {
  constructor(containerElement)
  
  // Load links from Local Storage
  loadLinks(): QuickLink[]
  
  // Save links to Local Storage
  saveLinks(): void
  
  // Add new quick link
  addLink(label: string, url: string): void
  
  // Remove quick link
  deleteLink(linkId: string): void
  
  // Open URL in new tab
  openLink(url: string): void
  
  // Generate unique link ID
  generateId(): string
  
  // Renders the component
  render(): void
}
```

**Key Methods**:
- `loadLinks()`: Reads from `localStorage.getItem('quickLinks')`, parses JSON
- `saveLinks()`: Writes to `localStorage.setItem('quickLinks', JSON.stringify(links))`
- `addLink()`: Creates QuickLink object, adds to array, saves, re-renders
- `deleteLink()`: Filters out link by ID, saves, re-renders
- `openLink()`: Calls `window.open(url, '_blank')`

### 5. Dashboard (Root Component)

**Responsibility**: Initialize and coordinate all components

**Interface**:
```javascript
class Dashboard {
  constructor()
  
  // Initialize all child components
  init(): void
  
  // Set up global event listeners
  setupEventListeners(): void
}
```

## Data Models

### Task Model

```javascript
interface Task {
  id: string,           // Unique identifier (UUID or timestamp-based)
  text: string,         // Task description (1-500 characters)
  completed: boolean,   // Completion status
  createdAt: number     // Unix timestamp (milliseconds)
}
```

**Validation Rules**:
- `id`: Must be unique, non-empty string
- `text`: Must be non-empty after trimming, max 500 characters
- `completed`: Boolean value
- `createdAt`: Positive integer timestamp

**Local Storage Key**: `"tasks"`
**Storage Format**: JSON array of Task objects

### QuickLink Model

```javascript
interface QuickLink {
  id: string,    // Unique identifier
  label: string, // Display text (1-50 characters)
  url: string    // Valid URL with protocol
}
```

**Validation Rules**:
- `id`: Must be unique, non-empty string
- `label`: Must be non-empty after trimming, max 50 characters
- `url`: Must be valid URL starting with http:// or https://

**Local Storage Key**: `"quickLinks"`
**Storage Format**: JSON array of QuickLink objects

### Time and Greeting Model

```javascript
interface TimeState {
  currentTime: Date,
  formattedTime: string,    // "h:mm:ss AM/PM"
  formattedDate: string,    // "DayOfWeek, Month Day"
  greeting: string          // Time-based greeting
}
```

**Greeting Logic**:
- 5:00 AM - 11:59 AM: "Good morning"
- 12:00 PM - 4:59 PM: "Good afternoon"
- 5:00 PM - 8:59 PM: "Good evening"
- 9:00 PM - 4:59 AM: "Good night"

### Timer Model

```javascript
interface TimerState {
  totalSeconds: number,      // Fixed at 1500 (25 minutes)
  remainingSeconds: number,  // 0 to 1500
  isRunning: boolean,
  displayTime: string        // "MM:SS" format
}
```

## Error Handling

### Local Storage Errors

**Scenario**: Local Storage is unavailable or quota exceeded

**Handling**:
1. Wrap all `localStorage` calls in try-catch blocks
2. If unavailable: Display warning message, operate in memory-only mode
3. If quota exceeded: Display error, prevent new data creation, suggest clearing old data
4. Gracefully degrade: Application remains functional without persistence

```javascript
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('Local Storage quota exceeded');
      showError('Storage full. Please delete some items.');
    } else {
      console.error('Local Storage unavailable');
      showError('Data will not be saved.');
    }
    return false;
  }
}
```

### Invalid Data Errors

**Scenario**: Corrupted data in Local Storage

**Handling**:
1. Validate data structure on load
2. If invalid: Log error, clear corrupted data, initialize with empty state
3. Provide user notification about data reset

```javascript
function loadTasks() {
  try {
    const data = localStorage.getItem('tasks');
    if (!data) return [];
    
    const tasks = JSON.parse(data);
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid tasks format');
    }
    
    // Validate each task
    return tasks.filter(task => 
      task.id && 
      typeof task.text === 'string' && 
      typeof task.completed === 'boolean'
    );
  } catch (e) {
    console.error('Failed to load tasks:', e);
    localStorage.removeItem('tasks');
    return [];
  }
}
```

### Timer Edge Cases

**Scenario**: Timer reaches zero

**Handling**:
1. Stop interval when remainingSeconds reaches 0
2. Prevent negative values
3. Optional: Play notification sound or show alert

**Scenario**: User navigates away while timer is running

**Handling**:
1. Timer stops (no background execution)
2. State is lost (acceptable for this use case)
3. Alternative: Store timer state in Local Storage with timestamp for resume capability

### URL Validation Errors

**Scenario**: User enters invalid URL for quick link

**Handling**:
1. Validate URL format before saving
2. Ensure protocol (http:// or https://) is present
3. Display error message for invalid URLs
4. Prevent saving invalid links

```javascript
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}
```

## Testing Strategy

### Unit Testing Approach

The application will use a dual testing strategy combining example-based unit tests and property-based tests:

**Unit Tests** (using Jest or Vitest):
- Specific examples demonstrating correct behavior
- Edge cases and error conditions
- Integration points between components
- DOM manipulation and event handling

**Property-Based Tests** (using fast-check for JavaScript):
- Universal properties that hold across all valid inputs
- Minimum 100 iterations per property test
- Each test tagged with reference to design property
- Focus on core logic (greeting calculation, timer countdown, task operations)

### Test Coverage by Component

**Greeting Display Component**:
- Unit tests: Specific time/greeting pairs, date formatting examples
- Property tests: Greeting logic across all hours, time formatting consistency

**Focus Timer Component**:
- Unit tests: Start/stop/reset button clicks, timer reaching zero
- Property tests: Countdown behavior, time formatting, state transitions

**Task List Component**:
- Unit tests: Adding specific tasks, editing examples, deletion scenarios
- Property tests: CRUD operations preserve data integrity, Local Storage synchronization

**Quick Links Component**:
- Unit tests: Adding/deleting specific links, URL validation examples
- Property tests: Link management operations, storage consistency

### Browser Compatibility Testing

- Manual testing in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Automated cross-browser testing using Playwright or Cypress
- Focus on Local Storage API compatibility and CSS rendering

### Performance Testing

- Measure initial load time (target: < 1 second)
- Measure action response time (target: < 100ms)
- Verify bundle size (target: < 500 KB)
- Test with large datasets (100+ tasks, 50+ links)

### Integration Testing

- End-to-end user workflows using Cypress or Playwright
- Test complete user journeys (add task → mark complete → delete)
- Verify Local Storage persistence across page reloads
- Test error scenarios (Local Storage unavailable, corrupted data)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Formatting Consistency

*For any* Date object, formatting the time SHALL produce a string in 12-hour format containing hour, minute, second, and AM/PM indicator.

**Validates: Requirements 1.1**

### Property 2: Date Formatting Completeness

*For any* Date object, formatting the date SHALL produce a string containing the day of week name, month name, and day number.

**Validates: Requirements 1.2, 1.4**

### Property 3: Greeting Correctness

*For any* hour value (0-23), the greeting function SHALL return:
- "Good morning" for hours 5-11
- "Good afternoon" for hours 12-16
- "Good evening" for hours 17-20
- "Good night" for hours 21-4

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Timer Tick Decrements Correctly

*For any* timer state where remainingSeconds > 0, calling tick() SHALL decrement remainingSeconds by exactly 1, and when remainingSeconds = 0, tick() SHALL not produce negative values.

**Validates: Requirements 3.3, 3.4**

### Property 5: Timer Stop Preserves State

*For any* timer state, calling stop() SHALL preserve the current remainingSeconds value and set isRunning to false.

**Validates: Requirements 3.5**

### Property 6: Timer Reset Idempotence

*For any* timer state, calling reset() SHALL set remainingSeconds to 1500 and isRunning to false, and calling reset() multiple times SHALL produce the same result.

**Validates: Requirements 3.6**

### Property 7: Timer Format Correctness

*For any* number of seconds in the range [0, 1500], formatting SHALL produce a string in MM:SS format where MM is zero-padded minutes and SS is zero-padded seconds.

**Validates: Requirements 3.7**

### Property 8: Task ID Uniqueness

*For any* sequence of task creation operations, all generated task IDs SHALL be unique within the task list.

**Validates: Requirements 4.5**

### Property 9: Task Operations Preserve Data Integrity

*For any* task operation (create, toggle completion, edit, delete):
1. The operation SHALL complete successfully with valid input
2. The resulting task list SHALL be immediately synchronized to Local Storage
3. Loading from Local Storage SHALL retrieve the exact task state after the operation
4. Task properties (id, text, completed, createdAt) SHALL remain valid after the operation

**Validates: Requirements 4.2, 4.3, 5.2, 5.3, 5.5, 6.3, 6.4, 7.2, 7.3, 8.1**

### Property 10: Task Edit Cancel Preserves Original State

*For any* task, initiating an edit and then canceling SHALL result in the task having the exact same text as before the edit was initiated.

**Validates: Requirements 6.5**

### Property 11: Task Input Clearing

*For any* valid task text, after creating a task, the input field SHALL be empty.

**Validates: Requirements 4.4**

### Property 12: Quick Link Operations Synchronize with Storage

*For any* quick link operation (create, delete):
1. The operation SHALL complete successfully with valid input
2. The resulting link list SHALL be immediately synchronized to Local Storage
3. Loading from Local Storage SHALL retrieve the exact link state after the operation
4. Link properties (id, label, url) SHALL remain valid after the operation

**Validates: Requirements 9.2, 9.5, 9.6**

### Property 13: Quick Link Navigation Correctness

*For any* valid quick link with a URL, clicking the link SHALL invoke window.open() with the correct URL and '_blank' target.

**Validates: Requirements 9.3**


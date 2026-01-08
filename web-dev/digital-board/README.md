# freeform digital board

this is a frontend-only application built with next.js that provides an infinite canvas for organizing text notes and images. it features persistent state, time travel (undo/redo), and a zoomable interface.

## tech stack

- framework: next.js 16 (app router)
- styling: tailwind css v4
- state management: zustand (with zundo for undo/redo)
- canvas interaction: react-zoom-pan-pinch
- drag and drop: react-draggable
- icons: lucide-react

## features

- infinite canvas: a zoomable and pannable workspace that expands effectively forever.
- drag and drop: items can be placed freely anywhere on the board.
- persistence: the board layout and content are saved to local storage and restored on reload.
- rich content: supports sticky notes with editable colors and resizable images.
- undo/redo: robust history management allows users to reverse actions.
- snapshots: users can save specific states of the board and restore them later.

## design decisions

### state management
chose zustand because of its performance with frequent updates. the 'subscribe' model of zustand allows tracking changes without triggering re-renders in unrelated components. 

zundo middleware was added to handle the complex requirement of undo/redo trees without writing manual history stacks.

### canvas architecture
i used react-zoom-pan-pinch because it handles the coordinate mapping between the screen (mouse events) and the virtual canvas, critical when combining zooming with dragging

### performance optimization
- individual pins are wrapped in react.memo to ensure that dragging one pin does not cause the entire board to re-render.
- the board uses a virtual size of 5000px but relies on css transforms for movement, keeping the dom layout calculations minimal during pans.
- state changes for view position are debounced (only saving on interaction stop) to prevent local storage thrashing.

## how to run
```bash
# install the dependencies:
npm install

# start the development server:
npm run dev

# build for production:
npm run build
npm start
```
import { Board } from './components/Board';
import { Toolbar } from './components/Toolbar';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <Board />
      <Toolbar />
      
      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm pointer-events-none z-40">
        <h1 className="font-bold text-gray-800">Freeform Board</h1>
        <ul className="text-xs text-gray-600 mt-2 space-y-1">
          <li>• Scroll to Zoom in/out</li>
          <li>• Click + Drag empty space to Pan</li>
          <li>• Drag notes to move</li>
        </ul>
      </div>
    </main>
  );
}
'use client';

import React, { useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useBoardStore } from '../store/useBoardStore';
import { Pin } from './Pin';

export const Board = () => {
  const pins = useBoardStore((state) => state.pins);
  
  // 1. Read the persisted view state
  const view = useBoardStore((state) => state.view);
  const updateView = useBoardStore((state) => state.updateView);

  // 2. Initialize local scale state from the persisted value
  const [scale, setScale] = useState(view.scale);

  // 3. Helper to save state to LocalStorage only when the user stops moving
  const handleSaveView = (ref: ReactZoomPanPinchRef) => {
    updateView(ref.state.positionX, ref.state.positionY, ref.state.scale);
    // Also sync local scale just in case
    setScale(ref.state.scale);
  };
  
  return (
    <div className="w-screen h-screen bg-[#f0f2f5] overflow-hidden cursor-crosshair">
      <TransformWrapper
        // 4. Restore the saved position and scale
        initialScale={view.scale}
        initialPositionX={view.x}
        initialPositionY={view.y}
        
        minScale={0.1}
        maxScale={4}
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}

        // 5. Update local 'scale' immediately for smooth Pin dragging physics
        onTransformed={(ref) => {
          setScale(ref.state.scale);
        }}

        // 6. Save to store (LocalStorage) only when interaction ends
        onPanningStop={handleSaveView}
        onZoomStop={handleSaveView}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full"
        >
          {/* The Infinite Canvas Area */}
          <div 
              className="relative w-[5000px] h-[5000px]"
              style={{ 
                  backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
              }}
          >
            {pins.map((pin) => (
              <Pin key={pin.id} pin={pin} scale={scale} />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};
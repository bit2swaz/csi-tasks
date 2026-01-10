'use client';

import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X, GripHorizontal } from 'lucide-react';
import { useBoardStore, Pin as PinType } from '../store/useBoardStore';
import 'react-resizable/css/styles.css';

interface PinProps {
  pin: PinType;
  scale: number;
}

export const Pin = React.memo(({ pin, scale }: PinProps) => {
  const updatePin = useBoardStore((state) => state.updatePin);
  const removePin = useBoardStore((state) => state.removePin);
  const [isEditing, setIsEditing] = useState(false);
  
  // 1. create a ref for the draggable element
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStop = (_e: any, data: { x: number; y: number }) => {
    updatePin(pin.id, { x: data.x, y: data.y });
  };

  return (
    <Draggable
      nodeRef={nodeRef} // 2. pass the ref here
      position={{ x: pin.x, y: pin.y }}
      scale={scale}
      handle=".drag-handle"
      onStop={handleStop}
      onMouseDown={(e: any) => e.stopPropagation()}
    >
      {/* 3. attach the ref to the actual DOM element */}
      <div 
        ref={nodeRef} 
        className="absolute top-0 left-0" 
        style={{ zIndex: isEditing ? 50 : 10 }}
      >
        {pin.type === 'text' ? (
          <div
            className="shadow-xl rounded-sm flex flex-col transition-shadow hover:shadow-2xl"
            style={{
              backgroundColor: pin.color,
              width: pin.width,
              minHeight: pin.height,
            }}
          >
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1 bg-black/5 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
              <GripHorizontal size={14} className="text-gray-600" />
              <button onClick={() => removePin(pin.id)} className="text-gray-600 hover:text-red-500">
                <X size={14} />
              </button>
            </div>

            <textarea
              className="w-full h-full bg-transparent p-4 resize-none outline-none font-handwriting text-gray-800"
              value={pin.content}
              onChange={(e) => updatePin(pin.id, { content: e.target.value })}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              style={{ minHeight: '150px' }}
            />
          </div>
        ) : (
          <div className="group relative shadow-lg hover:shadow-2xl transition-shadow">
             <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-black/20 z-10 cursor-grab opacity-0 group-hover:opacity-100 flex justify-end px-2 items-center">
                 <button onClick={() => removePin(pin.id)} className="text-white hover:text-red-500">
                    <X size={14} />
                 </button>
             </div>
            <ResizableBox
              width={pin.width}
              height={pin.height}
              lockAspectRatio={true}
              minConstraints={[100, 100]}
              onResizeStop={(_e, { size }) => {
                updatePin(pin.id, { width: size.width, height: size.height });
              }}
              draggableOpts={{ enableUserSelectHack: false }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pin.content}
                alt="pin"
                className="w-full h-full object-cover rounded-md pointer-events-none"
              />
            </ResizableBox>
          </div>
        )}
      </div>
    </Draggable>
  );
});

Pin.displayName = 'Pin';
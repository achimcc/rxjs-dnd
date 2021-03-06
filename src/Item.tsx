import { useEffect, useRef, useState } from "react";
import { map, switchMap, take, takeUntil, share } from "rxjs/operators";
import { fromEvent, merge } from "rxjs";
import styled from "styled-components";

interface Props {
  id: number;
  item: Item;
  moveToZone: Function;
}

type Pos = {
  x: number;
  y: number;
};

const ItemDiv = styled.div<{ isDragging: Boolean; pos: Pos }>`
  border: 2px solid #3eb0ef;
  border-radius: 10px/50%;
  color: rgba(255, 255, 255, 0.75);
  font-weight: bold;
  margin: 5px;
  padding: 10px;
  touch-action: none;
  box-sizing: border-box;
  background: ${(props) => (props.isDragging ? "#3eb0ef" : "transparent")};
  transform: translate(${(props) => `${props.pos.x}px, ${props.pos.y}`}px);
`;

const Item = ({ item, id, moveToZone }: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mousedown$ = fromEvent<PointerEvent>(
      itemRef.current as HTMLDivElement,
      "pointerdown"
    );
    const mousemove$ = fromEvent<PointerEvent>(document, "pointermove");
    const mouseup$ = fromEvent<PointerEvent>(document, "pointerup").pipe(
      share()
    );
    const drag$ = mousedown$.pipe(
      switchMap((start) => {
        return merge(
          mousemove$.pipe(
            map((move) => {
              move.preventDefault();
              return {
                type: "move",
                x: move.x - start.x,
                y: move.y - start.y,
              };
            }),
            takeUntil(mouseup$)
          ),
          mouseup$.pipe(
            map((endPos) => {
              return {
                type: "end",
                x: endPos.clientX,
                y: endPos.clientY,
              };
            }),
            take(1)
          )
        );
      })
    );

    const subscription = drag$.subscribe((evt) => {
      switch (evt.type) {
        case "move":
          setIsDragging(true);
          setPos((pos) => ({ x: evt.x, y: evt.y }));
          break;
        case "end":
          setIsDragging(false);
          const path = document
            .elementsFromPoint(evt.x, evt.y)
            .map((el) => el && el.id);
          const zones = ["Zone1", "Zone2"];
          const zoneToDrop = zones.find((zone) => path.includes(zone));
          if (zoneToDrop) {
            moveToZone(id, zoneToDrop);
          }
          setPos({ x: 0, y: 0 });
      }
    });
    return () => subscription.unsubscribe();
  }, [id, moveToZone]);

  return (
    <ItemDiv ref={itemRef} isDragging={isDragging} pos={pos} id={`item${id}`}>
      {item.title}
    </ItemDiv>
  );
};

export default Item;

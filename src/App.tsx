import React, { useEffect, useState } from "react";
import "./App.css";
import styled from "styled-components";
import { produce, enableMapSet } from "immer";
import Item from "./Item";

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 50px;
  margin: 5vw;
`;

const DropZone = styled.div`
  border: 1px solid black;
  width: 100%;
  min-height: 40vw;
`;

const items: Record<number, Item> = [...new Array(10)]
  .map((el, ind) => ind)
  .reduce((acc: Record<number, Item>, cur: number) => {
    acc[cur] = { title: `Item ${cur}` };
    return acc;
  }, {});

function App() {
  useEffect(() => {
    enableMapSet();
  }, []);
  const [zones, setZones] = useState({
    zone1: new Set<number>([...new Array<number>(10)].map((el, ind) => ind)),
    zone2: new Set<number>(),
  });

  const moveToZone = (idToSet: number, toZone: dropZone) => {
    setZones((zones) =>
      produce(zones, (draft) => {
        Object.keys(zones).forEach((zone) => {
          if (zone === toZone) draft[zone].add(idToSet);
          else draft[zone as dropZone].delete(idToSet);
        });
      })
    );
  };

  return (
    <div className="App">
      <Container>
        {Object.keys(zones).map((zone) => (
          <DropZone key={`${zone}`} id={`${zone}`}>
            <div>{zone}</div>
            {[...zones[zone as dropZone]].map((id: number) => (
              <Item item={items[id]} id={id} moveToZone={moveToZone} key={id} />
            ))}
          </DropZone>
        ))}
      </Container>
    </div>
  );
}

export default App;

"use client";
import SubscribeBar from "./SubscribeBar";
import SubscribePopup from "./SubscribePopup";

// Глобальні механіки залучення підписників — монтуються один раз у layout.
export default function SubscribeMechanics() {
  return (
    <>
      <SubscribeBar />
      <SubscribePopup />
    </>
  );
}

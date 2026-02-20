import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameState, type LocationId } from '@/hooks/useGameState';
import HUD from '@/components/game/HUD';
import InfluenceBar from '@/components/game/InfluenceBar';
import BottomNav, { type Tab } from '@/components/game/BottomNav';
import MapView from '@/components/game/MapView';
import TravelBar from '@/components/game/TravelBar';
import LocationPanel from '@/components/game/LocationPanel';
import InventoryPanel from '@/components/game/InventoryPanel';
import VehiclesPanel from '@/components/game/VehiclesPanel';
import QuestsPanel from '@/components/game/QuestsPanel';
import { toast } from 'sonner';

export default function Index() {
  const {
    state, startTravel, completeTravel, accelerateTravel,
    collectTree, collectHerb, plantCrop, harvestCrop, mineGold,
    buyHorse, evolveHorse, mountHorse, feedHorse, removeDeadHorse,
    collectSurpriseBox, buyItem, goToMap, useShield, pickupScroll,
  } = useGameState();

  const [tab, setTab] = useState<Tab>('mapa');
  const [viewingMap, setViewingMap] = useState(true);

  // Show notifications as toasts
  useEffect(() => {
    if (state.lastNotification) {
      const n = state.lastNotification;
      const bg = n.type === 'error' ? 'hsl(0 60% 15%)' : n.type === 'warning' ? 'hsl(30 60% 15%)' : 'hsl(30 20% 12%)';
      const border = n.type === 'error' ? '1px solid hsl(0 60% 40% / 0.3)' : n.type === 'warning' ? '1px solid hsl(30 80% 50% / 0.3)' : '1px solid hsl(40 80% 50% / 0.3)';
      toast(n.message, {
        style: { background: bg, border, color: 'hsl(40 30% 90%)' },
      });
    }
  }, [state.lastNotification?.at]);

  const handleLocationClick = useCallback((id: LocationId) => {
    if (state.travelingTo) return;
    if (state.currentLocation === id) {
      setViewingMap(false);
      setTab('mapa');
      return;
    }
    startTravel(id);
  }, [state.travelingTo, state.currentLocation, startTravel]);

  const handleSurpriseBox = useCallback(() => {
    collectSurpriseBox();
    toast('🎁 Surpresa! +3 Frutas, +10 Ouro, +1 Diamante', {
      style: { background: 'hsl(30 20% 12%)', border: '1px solid hsl(40 80% 50% / 0.3)', color: 'hsl(40 30% 90%)' },
    });
  }, [collectSurpriseBox]);

  const handleScrollClick = useCallback(() => {
    pickupScroll();
  }, [pickupScroll]);

  const handleTabChange = useCallback((t: Tab) => {
    if (t === 'mapa') setViewingMap(true);
    setTab(t);
  }, []);

  const handleBackToMap = useCallback(() => {
    setViewingMap(true);
  }, []);

  const handleTravelComplete = useCallback(() => {
    completeTravel();
    setViewingMap(false);
    setTab('mapa');
  }, [completeTravel]);

  const handleAccelerate = useCallback(() => {
    accelerateTravel();
    setViewingMap(false);
    setTab('mapa');
  }, [accelerateTravel]);

  const showLocationPanel = tab === 'mapa' && !viewingMap && state.currentLocation;
  const showMap = tab === 'mapa' && (viewingMap || !state.currentLocation);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <HUD state={state} />
      <InfluenceBar influence={state.influence} max={state.maxInfluence} />

      <div className="absolute inset-0 pt-[65px] pb-[60px]">
        {showMap && (
          <MapView
            state={state}
            onLocationClick={handleLocationClick}
            onSurpriseBox={handleSurpriseBox}
            onScrollClick={handleScrollClick}
          />
        )}

        <AnimatePresence mode="wait">
          {showLocationPanel && (
            <LocationPanel
              key={state.currentLocation}
              location={state.currentLocation!}
              state={state}
              onBack={handleBackToMap}
              onCollectTree={collectTree}
              onCollectHerb={collectHerb}
              onBuyHorse={buyHorse}
              onEvolveHorse={evolveHorse}
              onBuyItem={buyItem}
              onPlantCrop={plantCrop}
              onHarvestCrop={harvestCrop}
              onMineGold={mineGold}
              onFeedHorse={feedHorse}
              onRemoveDeadHorse={removeDeadHorse}
              onUseShield={useShield}
            />
          )}
          {tab === 'inventario' && <InventoryPanel key="inv" inventory={state.inventory} />}
          {tab === 'veiculos' && (
            <VehiclesPanel
              key="veh"
              horses={state.horses}
              mountedId={state.mountedHorseId}
              onMount={mountHorse}
              onFeed={feedHorse}
              onRemoveDead={removeDeadHorse}
            />
          )}
          {tab === 'quests' && <QuestsPanel key="q" state={state} />}
          {tab === 'config' && (
            <div key="cfg" className="absolute inset-0 z-20 bg-background/95 flex flex-col items-center justify-center">
              <span className="text-4xl">⚙️</span>
              <p className="font-display text-sm text-foreground mt-3">Configurações</p>
              <p className="text-xs text-muted-foreground mt-1">Em desenvolvimento...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <TravelBar
        travelingTo={state.travelingTo}
        travelEndTime={state.travelEndTime}
        onComplete={handleTravelComplete}
        onAccelerate={handleAccelerate}
        diamonds={state.diamonds}
      />

      <BottomNav active={tab} onTabChange={handleTabChange} />
    </div>
  );
}

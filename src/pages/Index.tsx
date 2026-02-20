import { useState, useCallback } from 'react';
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
    collectTree, plantCrop, harvestCrop, mineGold,
    buyHorse, evolveHorse, mountHorse,
    collectSurpriseBox, buyItem, goToMap,
  } = useGameState();

  const [tab, setTab] = useState<Tab>('mapa');
  const [viewingMap, setViewingMap] = useState(true);

  const handleLocationClick = useCallback((id: LocationId) => {
    if (state.travelingTo) return;
    // If already at this location, just open the panel directly
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

  const handleTabChange = useCallback((t: Tab) => {
    if (t === 'mapa') setViewingMap(true);
    setTab(t);
  }, []);

  const handleBackToMap = useCallback(() => {
    setViewingMap(true);
  }, []);

  // When travel completes, auto-open the location panel
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

      {/* Main content */}
      <div className="absolute inset-0 pt-[65px] pb-[60px]">
        {showMap && (
          <MapView state={state} onLocationClick={handleLocationClick} onSurpriseBox={handleSurpriseBox} />
        )}

        <AnimatePresence mode="wait">
          {showLocationPanel && (
            <LocationPanel
              key={state.currentLocation}
              location={state.currentLocation!}
              state={state}
              onBack={handleBackToMap}
              onCollectTree={collectTree}
              onBuyHorse={buyHorse}
              onEvolveHorse={evolveHorse}
              onBuyItem={buyItem}
              onPlantCrop={plantCrop}
              onHarvestCrop={harvestCrop}
              onMineGold={mineGold}
            />
          )}
          {tab === 'inventario' && <InventoryPanel key="inv" inventory={state.inventory} />}
          {tab === 'veiculos' && <VehiclesPanel key="veh" horses={state.horses} mountedId={state.mountedHorseId} onMount={mountHorse} />}
          {tab === 'quests' && <QuestsPanel key="q" activeQuests={state.questLocations} />}
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

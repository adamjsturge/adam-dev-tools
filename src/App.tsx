import { Suspense, useDeferredValue, useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { lazyRoute, prefetchAllRoutes } from "./routes";

const BackgroundRemoval = lazyRoute("/background-removal");
const Base64Decode = lazyRoute("/base64/decode");
const Base64Encode = lazyRoute("/base64/encode");
const BracketMaker = lazyRoute("/bracket-maker");
const CardAssumption = lazyRoute("/card-assumption");
const CaseConverter = lazyRoute("/case-converter");
const ColorBackgroundRemoval = lazyRoute("/color-background-removal");
const ColorOpacity = lazyRoute("/opacifier");
const TextCompare = lazyRoute("/compare");
const DeckbuilderLinks = lazyRoute("/deckbuilder-links");
const DeckDrawOdds = lazyRoute("/deck-draw-odds");
const DeckPrice = lazyRoute("/deck-price");
const EVCharging = lazyRoute("/ev-charging");
const ExtraLineRemoval = lazyRoute("/extra-line-removal");
const HashGenerator = lazyRoute("/hash");
const HTMLEntityDecode = lazyRoute("/html-entities/decode");
const HTMLEntityEncode = lazyRoute("/html-entities/encode");
const JSONFormatter = lazyRoute("/json");
const JWTDebugger = lazyRoute("/jwt");
const MultiDeckConverter = lazyRoute("/multi-deck-converter");
const QRCodeGenerator = lazyRoute("/qr-code");
const QRCodeScanner = lazyRoute("/qr-code/scan");
const SimCodeConverter = lazyRoute("/sim-code-converter");
const TextBin = lazyRoute("/textbin");
const Timestamp = lazyRoute("/timestamp");
const Unzip = lazyRoute("/unzip");
const URLDecode = lazyRoute("/url/decode");
const URLEncode = lazyRoute("/url/encode");
const UUIDGenerator = lazyRoute("/uuid");
const WebPConverter = lazyRoute("/webp");
const WordCounter = lazyRoute("/word-counter");

const AppRoutes = () => {
  const [location] = useLocation();
  // Deferring keeps the current page on screen while the next page's chunk
  // loads, instead of committing the empty Suspense fallback
  const deferredLocation = useDeferredValue(location);

  return (
    <Suspense fallback={null}>
      <Switch location={deferredLocation}>
        <Route path="/" component={Home} />

        <Route path="/base64/encode" component={Base64Encode} />
        <Route path="/base64/decode" component={Base64Decode} />

        <Route path="/qr-code" component={QRCodeGenerator} />
        <Route path="/qr-code/scan" component={QRCodeScanner} />

        <Route path="/url/encode" component={URLEncode} />
        <Route path="/url/decode" component={URLDecode} />

        <Route path="/html-entities/encode" component={HTMLEntityEncode} />
        <Route path="/html-entities/decode" component={HTMLEntityDecode} />

        <Route path="/webp" component={WebPConverter} />
        <Route path="/background-removal" component={BackgroundRemoval} />
        <Route
          path="/color-background-removal"
          component={ColorBackgroundRemoval}
        />
        <Route path="/textbin" component={TextBin} />
        <Route path="/extra-line-removal" component={ExtraLineRemoval} />
        <Route path="/word-counter" component={WordCounter} />
        <Route path="/unzip" component={Unzip} />
        <Route path="/deck-draw-odds" component={DeckDrawOdds} />
        <Route path="/card-assumption" component={CardAssumption} />
        <Route path="/sim-code-converter" component={SimCodeConverter} />
        <Route path="/deckbuilder-links" component={DeckbuilderLinks} />
        <Route path="/multi-deck-converter" component={MultiDeckConverter} />
        <Route path="/deck-price" component={DeckPrice} />
        <Route path="/bracket-maker" component={BracketMaker} />
        <Route path="/compare" component={TextCompare} />
        <Route path="/ev-charging" component={EVCharging} />
        <Route path="/opacifier" component={ColorOpacity} />
        <Route path="/jwt" component={JWTDebugger} />
        <Route path="/json" component={JSONFormatter} />
        <Route path="/hash" component={HashGenerator} />
        <Route path="/case-converter" component={CaseConverter} />
        <Route path="/timestamp" component={Timestamp} />
        <Route path="/uuid" component={UUIDGenerator} />

        <Route path="/home">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
};

const App = () => {
  const [location] = useLocation();

  useEffect(() => {
    prefetchAllRoutes();
  }, []);

  return (
    <Layout>
      <ErrorBoundary resetKey={location}>
        <AppRoutes />
      </ErrorBoundary>
    </Layout>
  );
};

export default App;

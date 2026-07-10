import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const BackgroundRemoval = lazy(() => import("./pages/BackgroundRemoval"));
const Base64Decode = lazy(() => import("./pages/Base64/Decode"));
const Base64Encode = lazy(() => import("./pages/Base64/Encode"));
const BracketMaker = lazy(() => import("./pages/BracketMaker"));
const CardAssumption = lazy(() => import("./pages/CardAssumption"));
const ColorBackgroundRemoval = lazy(
  () => import("./pages/ColorBackgroundRemoval"),
);
const ColorOpacity = lazy(() => import("./pages/ColorOpacity"));
const TextCompare = lazy(() => import("./pages/Compare"));
const DeckbuilderLinks = lazy(() => import("./pages/DeckbuilderLinks"));
const DeckDrawOdds = lazy(() => import("./pages/DeckDrawOdds"));
const DeckPrice = lazy(() => import("./pages/DeckPrice"));
const EVCharging = lazy(() => import("./pages/EVCharging"));
const ExtraLineRemoval = lazy(() => import("./pages/ExtraLineRemoval"));
const JWTDebugger = lazy(() => import("./pages/JWT"));
const MultiDeckConverter = lazy(() => import("./pages/MultiDeckConverter"));
const QRCodeGenerator = lazy(() => import("./pages/QRCode/Generator"));
const QRCodeScanner = lazy(() => import("./pages/QRCode/Scanner"));
const SimCodeConverter = lazy(() => import("./pages/SimCodeConverter"));
const TextBin = lazy(() => import("./pages/TextBin"));
const Unzip = lazy(() => import("./pages/Unzip"));
const URLDecode = lazy(() => import("./pages/URL/Decode"));
const URLEncode = lazy(() => import("./pages/URL/Encode"));
const WebPConverter = lazy(() => import("./pages/WebP"));
const WordCounter = lazy(() => import("./pages/WordCounter"));

const App = () => (
  <Layout>
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />

        <Route path="/base64/encode" component={Base64Encode} />
        <Route path="/base64/decode" component={Base64Decode} />

        <Route path="/qr-code" component={QRCodeGenerator} />
        <Route path="/qr-code/scan" component={QRCodeScanner} />

        <Route path="/url/encode" component={URLEncode} />
        <Route path="/url/decode" component={URLDecode} />

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

        <Route path="/home">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  </Layout>
);

export default App;

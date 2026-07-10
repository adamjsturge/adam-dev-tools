import { lazy, Suspense, useEffect } from "react";
import { Redirect, Route, Switch } from "wouter";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { prefetchAllRoutes, routeLoaders } from "./routes";

const BackgroundRemoval = lazy(routeLoaders["/background-removal"]);
const Base64Decode = lazy(routeLoaders["/base64/decode"]);
const Base64Encode = lazy(routeLoaders["/base64/encode"]);
const BracketMaker = lazy(routeLoaders["/bracket-maker"]);
const CardAssumption = lazy(routeLoaders["/card-assumption"]);
const ColorBackgroundRemoval = lazy(routeLoaders["/color-background-removal"]);
const ColorOpacity = lazy(routeLoaders["/opacifier"]);
const TextCompare = lazy(routeLoaders["/compare"]);
const DeckbuilderLinks = lazy(routeLoaders["/deckbuilder-links"]);
const DeckDrawOdds = lazy(routeLoaders["/deck-draw-odds"]);
const DeckPrice = lazy(routeLoaders["/deck-price"]);
const EVCharging = lazy(routeLoaders["/ev-charging"]);
const ExtraLineRemoval = lazy(routeLoaders["/extra-line-removal"]);
const JWTDebugger = lazy(routeLoaders["/jwt"]);
const MultiDeckConverter = lazy(routeLoaders["/multi-deck-converter"]);
const QRCodeGenerator = lazy(routeLoaders["/qr-code"]);
const QRCodeScanner = lazy(routeLoaders["/qr-code/scan"]);
const SimCodeConverter = lazy(routeLoaders["/sim-code-converter"]);
const TextBin = lazy(routeLoaders["/textbin"]);
const Unzip = lazy(routeLoaders["/unzip"]);
const URLDecode = lazy(routeLoaders["/url/decode"]);
const URLEncode = lazy(routeLoaders["/url/encode"]);
const WebPConverter = lazy(routeLoaders["/webp"]);
const WordCounter = lazy(routeLoaders["/word-counter"]);

const App = () => {
  useEffect(() => {
    prefetchAllRoutes();
  }, []);

  return (
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
};

export default App;

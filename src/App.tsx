import { Redirect, Route, Switch } from "wouter";
import Layout from "./components/Layout";
import BackgroundRemoval from "./pages/BackgroundRemoval";
import Base64Decode from "./pages/Base64/Decode";
import Base64Encode from "./pages/Base64/Encode";
import CardAssumption from "./pages/CardAssumption";
import ColorBackgroundRemoval from "./pages/ColorBackgroundRemoval";
import ColorOpacity from "./pages/ColorOpacity";
import TextCompare from "./pages/Compare";
import DeckbuilderLinks from "./pages/DeckbuilderLinks";
import DeckDrawOdds from "./pages/DeckDrawOdds";
import EVCharging from "./pages/EVCharging";
import ExtraLineRemoval from "./pages/ExtraLineRemoval";
import Home from "./pages/Home";
import JWTDebugger from "./pages/JWT";
import NotFound from "./pages/NotFound";
import QRCodeGenerator from "./pages/QRCode/Generator";
import QRCodeScanner from "./pages/QRCode/Scanner";
import SimCodeConverter from "./pages/SimCodeConverter";
import TextBin from "./pages/TextBin";
import Unzip from "./pages/Unzip";
import URLDecode from "./pages/URL/Decode";
import URLEncode from "./pages/URL/Encode";
import WebPConverter from "./pages/WebP";
import WordCounter from "./pages/WordCounter";

const App = () => (
  <Layout>
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
      <Route path="/compare" component={TextCompare} />
      <Route path="/ev-charging" component={EVCharging} />
      <Route path="/opacifier" component={ColorOpacity} />
      <Route path="/jwt" component={JWTDebugger} />

      <Route path="/home">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  </Layout>
);

export default App;

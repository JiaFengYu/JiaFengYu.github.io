import { assetPath } from "../lib/site";
import ShootingStars from "./ShootingStars";
import StarField from "./StarField";

export default function NightSky() {
  return (
    <div className="night-sky" aria-hidden="true">
      <StarField imageSrc={assetPath("/images/night-sky.svg")} />
      <ShootingStars />
    </div>
  );
}

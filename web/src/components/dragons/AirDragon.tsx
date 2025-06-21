import Image from "next/image";

export default function AirDragon({
    direction = "side-l",
}: {
    direction: "side-l" | "top" | "side-r";
}) {
    const getImageSrc = () => {
        if (direction === "side-l" || direction === "side-r") {
            return "/images/dragons/side.gif";
        }
        return `/images/dragons/${direction}.gif`;
    };

    const getTransformStyle = () => {
        if (direction === "side-r") {
            return { transform: "scaleX(-1)" };
        }
        return {};
    };

    return (
        <div className="group relative">
            <div className="relative p-4 bg-gradient-to-br from-gray-600/20 to-slate-600/20 rounded-2xl border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                    src={getImageSrc()}
                    alt="Air Dragon"
                    width={120}
                    height={96}
                    style={getTransformStyle()}
                    className="relative z-10 filter drop-shadow-lg grayscale hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            </div>

            {/* Dragon Type Label */}
            <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600/20 text-gray-300 text-sm font-cinzel font-semibold rounded-full border border-gray-500/30 tracking-wide">
                    💨 Air
                </span>
            </div>
        </div>
    );
}
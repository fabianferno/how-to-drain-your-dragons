import Image from "next/image";

export default function FireDragon({
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
        <div className="relative group">
            <div className="p-4 bg-red-600/20 rounded-2xl border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
                <Image
                    src={getImageSrc()}
                    alt="Fire Dragon"
                    width={120}
                    height={96}
                    style={getTransformStyle()}
                    className="drop-shadow-lg"
                />
            </div>

            <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-300 text-sm font-semibold rounded-full border border-red-500/30">
                    🔥 Fire
                </span>
            </div>
        </div>
    );
}
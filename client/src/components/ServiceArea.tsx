/*
 * ServiceArea — Southern Ground Capital
 * Design: Industrial Precision — professional geographic USA map
 * Shows nationwide lending with excluded states highlighted
 */

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const GEO_URL = "/states-10m.json";

const EXCLUDED = new Set(["AZ", "NV", "ND", "OR", "SD", "UT", "VT"]);

const excludedStateNames = [
  "Arizona", "Nevada", "North Dakota", "Oregon",
  "South Dakota", "Utah", "Vermont",
];

// FIPS code → state abbreviation
const FIPS: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

export default function ServiceArea() {
  const [tooltip, setTooltip] = useState<string | null>(null);

  return (
    <section id="service-area" className="py-24 bg-[#F0F4F8]">
      <div className="container">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#E8A020]" />
            <span className="text-[#E8A020] text-xs font-mono tracking-[0.25em] uppercase">
              Service Area
            </span>
            <div className="h-px w-12 bg-[#E8A020]" />
          </div>
          <h2 className="font-display text-[#0A1628] text-4xl md:text-5xl leading-tight mb-4">
            WE LEND
            <br />
            <span className="text-[#E8A020]">NATIONWIDE</span>
          </h2>
          <p className="text-[#0A1628]/60 max-w-xl mx-auto text-sm leading-relaxed">
            Southern Ground Capital provides private lending solutions across
            the United States, with a few exceptions noted below.
          </p>
        </div>

        {/* Map Card */}
        <div className="bg-white rounded-sm border border-[#0A1628]/10 shadow-[0_12px_40px_rgba(10,22,40,0.08)] p-6 md:p-10 max-w-5xl mx-auto">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h3 className="font-display text-[#0A1628] text-2xl leading-tight">
              UNITED STATES COVERAGE
            </h3>
            <p className="text-[#0A1628]/50 text-sm mt-1">State Availability Map</p>
          </div>

          {/* Geographic Map */}
          <div className="w-full relative">
            {tooltip && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-[#0A1628] text-white text-xs font-medium px-3 py-1.5 rounded-sm pointer-events-none shadow-lg">
                {tooltip}
              </div>
            )}
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{ scale: 900 }}
              style={{ width: "100%", height: "auto" }}
              viewBox="0 0 800 500"
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const abbr = FIPS[geo.id as string] ?? "";
                    const excluded = EXCLUDED.has(abbr);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() =>
                          setTooltip(
                            excluded
                              ? `${abbr} — Not Available`
                              : `${abbr} — Available`
                          )
                        }
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: {
                            fill: excluded ? "#0A1628" : "#2563EB",
                            stroke: excluded ? "#E8A020" : "#ffffff",
                            strokeWidth: excluded ? 2 : 0.75,
                            outline: "none",
                          },
                          hover: {
                            fill: excluded ? "#162B52" : "#1d4ed8",
                            stroke: excluded ? "#F0B840" : "#ffffff",
                            strokeWidth: excluded ? 2.5 : 0.75,
                            outline: "none",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-4 pt-5 border-t border-[#0A1628]/8">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-[3px] bg-[#2563EB]" />
              <span className="text-[#0A1628]/60 text-xs font-medium">Available States</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-[3px] bg-[#0A1628] ring-2 ring-[#E8A020]/80 ring-inset" />
              <span className="text-[#0A1628]/60 text-xs font-medium">
                Not Available States (AZ, NV, ND, OR, SD, UT, VT)
              </span>
            </div>
          </div>
        </div>

        {/* Excluded States Banner */}
        <div className="mt-8 bg-[#0A1628] rounded-sm p-5 md:p-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-[#E8A020] flex-shrink-0" />
            <p className="text-white/70 text-sm font-medium">
              <span className="font-mono text-[#E8A020]/80">***</span> We do
              not currently lend in the following states:
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {excludedStateNames.map((state) => (
              <span
                key={state}
                className="bg-[#E8A020]/15 border border-[#E8A020]/30 text-[#E8A020] text-xs font-medium px-3 py-1.5 rounded-sm flex items-center gap-1.5"
              >
                <AlertCircle size={11} className="flex-shrink-0" />
                {state}
              </span>
            ))}
          </div>
          <div className="flex items-start gap-2 pt-3 border-t border-white/10">
            <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs leading-relaxed">
              All other U.S. states and Washington D.C. are eligible. Contact
              us to confirm availability for your specific property location.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

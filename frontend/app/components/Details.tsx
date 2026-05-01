import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

// 1. Refined Score Badge to use standard Tailwind colors
const ScoreBadge = ({ score }: { score: number }) => {
  const isExcellent = score >= 70;
  const isAverage = score >= 50 && score < 70;

  return (
    <div
      className={cn(
        "flex flex-row gap-1.5 items-center px-3 py-1 rounded-full border",
        isExcellent
          ? "bg-green-50 border-green-200 text-green-700"
          : isAverage
          ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-red-50 border-red-200 text-red-700"
      )}
    >
      <span className="text-sm font-bold tracking-tight">
        {score}<span className="opacity-60 font-medium text-xs">/100</span>
      </span>
    </div>
  );
};

// 2. Clean Category Header
const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row max-[330px]:flex-col gap-3 text-sm sm:text-lg justify-between items-center w-full pr-4">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

// 3. Modernized Category Content (Removed the redundant double-mapping)
const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 w-full sm:mt-2">
      {tips.map((tip, index) => {
        const isGood = tip.type === "good";
        
        return (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-2 rounded-xl p-4 border shadow-sm transition-colors",
              isGood
                ? "bg-white border-green-100 hover:border-green-200"
                : "bg-white border-amber-100 hover:border-amber-200"
            )}
          >
            {/* Tip Title & Icon */}
            <div className="flex flex-row gap-3 items-start">
              <div className={cn(
                "p-1.5 rounded-lg shrink-0",
                isGood ? "bg-green-50" : "bg-amber-50"
              )}>
                <img
                  src={isGood ? "/icons/check.svg" : "/icons/warning.svg"}
                  alt={isGood ? "Good" : "Needs Improvement"}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className={cn(
                  "text-base font-bold",
                  isGood ? "text-slate-800" : "text-slate-800"
                )}>
                  {tip.tip}
                </p>
                {/* Tip Explanation */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {tip.explanation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 4. Main Details Component wrapper
const Details = ({ feedback }: { feedback: any }) => {
  // Assuming 'feedback' matches your JSON structure
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800">Detailed Breakdown</h2>
        <p className="text-sm text-slate-500">Expand each section to see specific feedback and actionable tips.</p>
      </div>

      <Accordion allowMultiple>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title="Content Impact"
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Formatting & Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title="Skills Alignment"
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;
const PLACEHOLDER = "Placeholder description. The mentor will replace this before publishing.";
const LAW = "Strategy compiled by Grand Mentor Abdiwali Moalimuu. Placeholder description. The mentor will replace this before publishing.";

function module(title, track, lessons, description = PLACEHOLDER) {
  return { title, track, description, lessons };
}

export const COURSE_OUTLINE = {
  title: "Forex: From Beginner to Advanced",
  description: PLACEHOLDER,
  phases: [
    {
      title: "Beginner",
      description: PLACEHOLDER,
      modules: [
        module("Introduction to Forex", "core", ["What forex is", "How the market works", "Sessions", "Participants"]),
        module("Trading Basics", "core", ["Pairs", "Pips", "Lots", "Leverage", "Margin", "Spreads"]),
        module("Platforms and Charts", "core", ["Broker setup", "MT4 and MT5", "TradingView", "Candlesticks", "Timeframes"]),
        module("Basic Technical Analysis", "core", ["Support and resistance", "Trends"]),
        module("Risk Management Foundations", "risk", ["Risk management foundations"]),
        module("Trading Psychology Foundations", "psychology", ["Trading psychology foundations"]),
        module("Personal Development Foundations", "development", ["Goals", "Discipline", "Routines", "Time management"]),
        module("Demo Account Practice", "core", ["Demo account practice"])
      ]
    },
    {
      title: "Intermediate",
      description: PLACEHOLDER,
      modules: [
        module("Market Structure", "core", ["Market structure"]),
        module("Indicators and Confirmation", "core", ["Indicators and confirmation"]),
        module("Entries, Exits and Trade Management", "core", ["Entries", "Exits", "Trade management"]),
        module("Fundamental Analysis and News", "core", ["Fundamental analysis and news"]),
        module("Law and Order Strategy, Part 1", "core", ["Law and Order, part 1"], LAW),
        module("Risk Management", "risk", ["Position sizing", "Risk-reward", "Drawdown"]),
        module("Trading Psychology", "psychology", ["Fear", "FOMO", "Revenge trading"]),
        module("Personal Development", "development", ["Journaling", "Habits", "Financial literacy"])
      ]
    },
    {
      title: "Advanced",
      description: PLACEHOLDER,
      modules: [
        module("Advanced Price Action and Multi-Timeframe Analysis", "core", ["Advanced price action", "Multi-timeframe analysis"]),
        module("Law and Order Strategy, Full Execution", "core", ["Law and Order, full execution"], LAW),
        module("Advanced Risk Management", "risk", ["Portfolio risk", "Correlation", "Scaling", "Account rules"]),
        module("Performance Psychology", "psychology", ["Handling drawdowns", "Consistency"]),
        module("Personal Development", "development", ["Long-term wealth", "Health", "Business mindset"]),
        module("Building a Trading Plan and Journal", "core", ["Trading plan", "Trading journal"]),
        module("Live Sessions and Trade Reviews", "core", ["Live sessions", "Trade reviews"]),
        module("Final Assessment", "core", ["Final assessment"])
      ]
    }
  ]
};

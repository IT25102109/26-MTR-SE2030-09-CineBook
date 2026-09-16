#!/bin/bash
# CineBook - Helper script to commit and push work attributed to a specific team member
# Usage: ./scripts/commit_as_member.sh <IT_NUMBER> "<commit message>"

set -e

IT_NUM=$(echo "$1" | tr '[:lower:]' '[:upper:]')
MSG="$2"

if [ -z "$IT_NUM" ] || [ -z "$MSG" ]; then
  echo "Usage: ./scripts/commit_as_member.sh <IT_NUMBER> \"<commit message>\""
  echo "Example: ./scripts/commit_as_member.sh IT25101943 \"feat(seat-booking): implement seat selection matrix\""
  echo ""
  echo "Available Members:"
  echo "  IT25100588 -> Kariyawasam K.K.S.S (Movie & Content Discovery)"
  echo "  IT25101655 -> Liyanagama P.B (Booking History & Refunds)"
  echo "  IT25101943 -> Janaka P.G.C. (Seat Selection & Booking Engine)"
  echo "  IT25101952 -> Lekamwasam N.L.P.M (Reporting & Analytics)"
  echo "  IT25102109 -> Bhanuka N.A.D. (Movie, Showtime & Cinema Management)"
  echo "  IT25102892 -> Thathsara M.A.B. (Payment Processing & E-Ticket)"
  exit 1
fi

case "$IT_NUM" in
  IT25100588)
    NAME="Kariyawasam K.K.S.S"
    EMAIL="it25100588@my.sliit.lk"
    BRANCH="feature/movie-content-discovery"
    ;;
  IT25101655)
    NAME="Liyanagama P.B"
    EMAIL="it25101655@my.sliit.lk"
    BRANCH="feature/booking-history-refunds"
    ;;
  IT25101943)
    NAME="Janaka P.G.C."
    EMAIL="it25101943@my.sliit.lk"
    BRANCH="feature/seat-booking-engine"
    ;;
  IT25101952)
    NAME="Lekamwasam N.L.P.M"
    EMAIL="it25101952@my.sliit.lk"
    BRANCH="feature/admin-reporting-analytics"
    ;;
  IT25102109)
    NAME="Bhanuka N.A.D."
    EMAIL="it25102109@my.sliit.lk"
    BRANCH="feature/movie-showtime-cinema"
    ;;
  IT25102892)
    NAME="Thathsara M.A.B."
    EMAIL="it25102892@my.sliit.lk"
    BRANCH="feature/payment-eticket"
    ;;
  *)
    echo "❌ Unknown IT Number: $IT_NUM"
    exit 1
    ;;
esac

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "⚠️ Current branch is '$CURRENT_BRANCH'. Switching to '$BRANCH'..."
  git checkout "$BRANCH"
fi

echo "📦 Staging changes..."
git add .

echo "✍️ Committing as: $NAME <$EMAIL>..."
git commit --allow-empty --author="$NAME <$EMAIL>" -m "$MSG"

echo "🚀 Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "✅ Done! Commit pushed under $NAME ($EMAIL) on branch $BRANCH."

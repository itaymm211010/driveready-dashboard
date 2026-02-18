import { AlertCircle, RefreshCw, WifiOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  variant?: 'default' | 'compact' | 'inline';
  type?: 'generic' | 'network' | 'server';
}

/**
 * Reusable error display component for query errors and API failures
 */
export function ErrorDisplay({
  title,
  message,
  error,
  onRetry,
  variant = 'default',
  type = 'generic',
}: ErrorDisplayProps) {
  const errorMessage = message || (error instanceof Error ? error.message : 'אירעה שגיאה');

  const Icon = type === 'network' ? WifiOff : type === 'server' ? Server : AlertCircle;

  const defaultTitles = {
    generic: 'שגיאה',
    network: 'בעיית חיבור',
    server: 'שגיאת שרת',
  };

  const defaultMessages = {
    generic: 'אירעה שגיאה. אנא נסה שוב.',
    network: 'לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט.',
    server: 'השרת לא זמין כרגע. אנא נסה שוב מאוחר יותר.',
  };

  const displayTitle = title || defaultTitles[type];
  const displayMessage = errorMessage || defaultMessages[type];

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="flex-1 text-sm">
          <p className="font-medium">{displayTitle}</p>
          <p className="text-destructive/80 text-xs mt-0.5">{displayMessage}</p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/20"
            aria-label="נסה שוב"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{displayTitle}</h4>
          <p className="text-sm text-muted-foreground mt-1">{displayMessage}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="ml-2 h-4 w-4" />
            נסה שוב
          </Button>
        )}
      </div>
    );
  }

  // Default variant - card
  return (
    <Card className="border-destructive/30 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{displayTitle}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">{displayMessage}</p>
          </div>

          {error && process.env.NODE_ENV === 'development' && (
            <details className="w-full text-xs text-right bg-muted/50 p-3 rounded-lg">
              <summary className="cursor-pointer font-medium mb-2">
                פרטים טכניים (dev only)
              </summary>
              <code className="block mt-2 text-destructive break-all whitespace-pre-wrap">
                {error instanceof Error ? error.stack || error.message : String(error)}
              </code>
            </details>
          )}

          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              <RefreshCw className="ml-2 h-4 w-4" />
              נסה שוב
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

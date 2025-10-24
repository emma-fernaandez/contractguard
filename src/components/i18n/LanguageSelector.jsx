import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from './I18nProvider';

const languages = [
{ code: 'en', name: 'English', flag: '🇬🇧' },
{ code: 'es', name: 'Español', flag: '🇪🇸' },
{ code: 'it', name: 'Italiano', flag: '🇮🇹' }];


export default function LanguageSelector({ variant = "ghost", size = "sm", showFullName = false }) {
  const { language, changeLanguage } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="bg-background pt-3 pr-3 pb-3 pl-3 px-3 text-sm font-medium rounded-md inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-9 gap-2">
          <Globe className="w-4 h-4" />
          {showFullName ?
          <span>{currentLanguage.name}</span> :

          <>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
              <span className="sm:hidden">{currentLanguage.flag}</span>
            </>
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) =>
        <DropdownMenuItem
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={language === lang.code ? 'bg-blue-50' : ''}>

            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>);

}
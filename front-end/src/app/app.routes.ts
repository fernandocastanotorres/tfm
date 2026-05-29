import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './adapters/components/public-layout/public-layout.component';
import { PublicHomeComponent } from './adapters/components/public-home/public-home.component';
import { ErrorPageComponent } from './adapters/components/error-page/error-page.component';

export const routes: Routes = [
  // Public routes with shared header/footer (no auth required)
  {
    path: 'sede',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: PublicHomeComponent, title: 'PUBLIC.NAV_HOME' },
      { path: '', loadChildren: () => import('./adapters/routes/public-info.routes').then(m => m.PUBLIC_INFO_ROUTES) },
      // Do not preload protected routes; keep initial JS minimal for public landing pages.
      { path: '', loadChildren: () => import('./adapters/routes/protected.routes').then(m => m.PROTECTED_ROUTES) },
      // Preload frequently used public flows to keep navigation snappy without pulling in protected code.
      { path: '', loadChildren: () => import('./adapters/routes/public-lazy.routes').then(m => m.PUBLIC_LAZY_ROUTES), data: { preload: true } },
      // Auth pages inside public layout so they share header/footer.
      // Lazy-loaded to keep Forms code out of the public landing page bundles.
      { path: '', loadChildren: () => import('./adapters/routes/auth.routes').then(m => m.AUTH_ROUTES) }
    ]
  },
  { path: 'sede/error/403', component: ErrorPageComponent, data: { variant: '403' }, title: 'PUBLIC.ERROR_403_TITLE' },
  { path: 'sede/error/404', component: ErrorPageComponent, data: { variant: '404' }, title: 'PUBLIC.ERROR_404_TITLE' },
  { path: 'sede/error/500', component: ErrorPageComponent, data: { variant: '500' }, title: 'PUBLIC.ERROR_500_TITLE' },
  // Legacy redirects for auth routes
  { path: 'login', redirectTo: 'sede/login', pathMatch: 'full' },
  { path: 'registro', redirectTo: 'sede/registro', pathMatch: 'full' },
  { path: 'recuperacion', redirectTo: 'sede/recuperacion', pathMatch: 'full' },
  { path: 'expedientes/nuevo', redirectTo: 'sede/expedientes/nuevo', pathMatch: 'full' },
  { path: 'expedientes/nuevo/:procedureId', redirectTo: 'sede/expedientes/nuevo/:procedureId' },
  { path: 'expedientes/:id/detalle', redirectTo: 'sede/expedientes/:id/detalle' },
  { path: 'expedientes/detalle', redirectTo: 'sede/expedientes/detalle', pathMatch: 'full' },
  { path: 'mensajes', redirectTo: 'sede/mensajes', pathMatch: 'full' },
  { path: 'carpeta', redirectTo: 'sede/carpeta', pathMatch: 'full' },
  { path: 'perfil', redirectTo: 'sede/perfil', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'sede/dashboard', pathMatch: 'full' },
  { path: 'notificaciones', redirectTo: 'sede/notificaciones', pathMatch: 'full' },
  { path: 'documentos', redirectTo: 'sede/documentos', pathMatch: 'full' },
  { path: 'pagos', redirectTo: 'sede/pagos', pathMatch: 'full' },
  {
    path: '',
    redirectTo: 'sede',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'sede/error/404'
  }
];

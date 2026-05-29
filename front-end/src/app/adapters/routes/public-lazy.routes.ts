import { Routes } from '@angular/router';
import { ProceduresComponent } from '../components/procedures/procedures.component';
import { ProcedureFlowComponent } from '../components/procedure-flow/procedure-flow.component';
import { AppointmentsComponent } from '../components/appointments/appointments.component';

export const PUBLIC_LAZY_ROUTES: Routes = [
  { path: 'procedimientos', component: ProceduresComponent, title: 'PROCEDURES.TITLE' },
  { path: 'procedimientos/:procedureId/flujo', component: ProcedureFlowComponent, title: 'PROCEDURE_FLOW.TITLE' },
  { path: 'citas', component: AppointmentsComponent, title: 'APPOINTMENTS.TITLE' },
];

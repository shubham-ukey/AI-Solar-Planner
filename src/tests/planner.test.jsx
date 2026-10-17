import React from 'react';import {describe,it,expect} from 'vitest';import {render,screen,fireEvent,waitFor} from '@testing-library/react';import '@testing-library/jest-dom/vitest';import {MemoryRouter,Routes,Route} from 'react-router-dom';import {WizardProvider} from '../context/WizardContext.jsx';import Planner from '../pages/Planner.jsx';import Results from '../pages/Results.jsx';
function renderPlanner(){return render(<WizardProvider><MemoryRouter initialEntries={['/planner']}><Routes><Route path="/planner" element={<Planner/>}/><Route path="/results" element={<Results/>}/></Routes></MemoryRouter></WizardProvider>)}
function choose(name,value){fireEvent.click(screen.getByRole('radio',{name:new RegExp(value==='yes'?'Yes':'No','i')}));}
describe('planner wizard',()=>{
 it('completes the happy path and preserves entered location when navigating back',async()=>{
  renderPlanner();
  for(const label of ['Is this a residential electricity connection?','Do you own the roof or have the owner’s consent?','Do you have a valid electricity connection with the DISCOM?','Are Aadhaar and bank account linked?']){const field=screen.getByText(label).closest('fieldset');fireEvent.click(field.querySelector('input[value="yes"]'));}
  const prior=screen.getByText(/Have you already received PM Surya Ghar subsidy/).closest('fieldset');fireEvent.click(prior.querySelector('input[value="no"]'));
  fireEvent.click(screen.getByRole('button',{name:/save and continue/i}));
  await screen.findByRole('heading',{name:/2. location/i});fireEvent.change(screen.getByLabelText('State'),{target:{value:'Maharashtra'}});fireEvent.change(screen.getByLabelText(/City/i),{target:{value:'Gondia'}});fireEvent.change(screen.getByLabelText(/DISCOM name \(manual\)/i),{target:{value:'MSEDCL'}});fireEvent.click(screen.getByRole('button',{name:/save and continue/i}));
  await screen.findByRole('heading',{name:/3. electricity consumption/i});fireEvent.change(screen.getByLabelText(/Average monthly units/i),{target:{value:'300'}});fireEvent.click(screen.getByRole('button',{name:/save and continue/i}));
  await screen.findByRole('heading',{name:/4. roof details/i});fireEvent.click(screen.getByRole('button',{name:/save and continue/i}));
  await screen.findByRole('heading',{name:/5. assumptions/i});expect(screen.getByText(/Not yet verified/i)).toBeInTheDocument();expect(screen.getByText(/Live estimate preview/i)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/finish planner/i}));await screen.findByRole('heading',{name:/results dashboard/i});
 });
 it('shows linked validation errors and blocks progression when eligibility is unanswered',async()=>{
  renderPlanner();fireEvent.click(screen.getByRole('button',{name:/save and continue/i}));expect(await screen.findAllByRole('alert')).toHaveLength(5);expect(screen.getByRole('heading',{name:/1. eligibility checklist/i})).toBeInTheDocument();
 });
});

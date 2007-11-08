/*
 * Chickenfoot end-user web automation system
 *
 * Copyright (c) 2004-2007 Massachusetts Institute of Technology
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Chickenfoot homepage: http://uid.csail.mit.edu/chickenfoot/
 */
#include "ChickenSleep.h"

// ChickenSleep is basically just an event loop, which makes sure
// that both GUI events and network I/O are serviced while we're
// sleeping.  The particular way that this loop pumps events is 
// a platform-dependent combination of the following techniques:
//
//  PUMP_XPCOM_EVENTS: fetches events from nsIEventQueue and
//       dispatches them.  This is Mozilla's high-level,
//       platform-independent event mechanism.  Must be pumped
//       on Linux and Mac, otherwise network connections won't
//       be serviced.
//
//  PUMP_NATIVE_EVENTS: fetches and dispatches events using 
//       nsIAppShell.  This is a thin platform-independent 
//       layer over the platform's native GUI event queue.
//       GUI events must be pumped on all platforms, but this
//       simple approach *can't* be used on Linux, because 
//       there's no way to poll with this interface.  
//       The GetEvent call blocks, which would starve the XPCOM 
//       part of the event loop.
//
//  PUMP_GTK_EVENTS: fetches and dispatches events for the GTK
//       toolkit, which is used by Firefox on Linux (at least for
//       the main releases).  By using GTK directly, we can poll
//       for events rather than blocking.
//
//  Either PUMP_NATIVE_EVENTS or PUMP_GTK_EVENTS must be defined.
//  Most platforms also require PUMP_XPCOM_EVENTS to be defined;
//  Windows doesn't appear to need it, though.

#if defined(_WINDOWS)
  #define PUMP_NATIVE_EVENTS
#elif defined(_LINUX)
  #define PUMP_XPCOM_EVENTS
  #define PUMP_GTK_EVENTS
#elif defined(_MACOS)
  #define PUMP_XPCOM_EVENTS
  #define PUMP_NATIVE_EVENTS
#else
  #error Cannot compile for this platform
#endif


#include "nsCOMPtr.h"
#include "nsComponentManagerUtils.h"
#include "nsServiceManagerUtils.h"
#include "prinrval.h"

#ifdef PUMP_XPCOM_EVENTS
#include "nsIEventQueueService.h"
#endif

#ifdef PUMP_NATIVE_EVENTS
#include "nsIAppShell.h"
#include "nsWidgetsCID.h"
static NS_DEFINE_CID(kAppShellCID, NS_APPSHELL_CID);
#endif

#ifdef PUMP_GTK_EVENTS
#include <gtk/gtkmain.h>
#endif

#include <stdio.h>

NS_IMPL_ISUPPORTS1(ChickenSleep, IChickenSleep)

ChickenSleep::ChickenSleep()
{
  /* member initializers and constructor code */
	sleeping = PR_FALSE;
	verbose = PR_FALSE;
}

ChickenSleep::~ChickenSleep()
{
  /* destructor code */
}


NS_IMETHODIMP ChickenSleep::Sleep(PRInt32 milliseconds)
{
    nsresult rv;
	if (verbose) printf("ChickenSleep: entering Sleep()\n");

	if (sleeping) {
		if (verbose) printf("ChickenSleep: error: this object is already sleeping\n");
		return NS_ERROR_FAILURE;
	}

#ifdef PUMP_XPCOM_EVENTS
    nsCOMPtr<nsIEventQueueService> eventQueueService(do_GetService("@mozilla.org/event-queue-service;1"));
    NS_ENSURE_TRUE(eventQueueService, NS_ERROR_FAILURE);

    nsCOMPtr<nsIEventQueue> eventQueue;
    rv = eventQueueService->ResolveEventQueue(NS_CURRENT_EVENTQ, getter_AddRefs(eventQueue));
    NS_ENSURE_SUCCESS(rv, rv);
    if (verbose) printf("ChickenSleep: event queue is %p\n", (nsIEventQueue*)eventQueue);
#endif

#ifdef PUMP_NATIVE_EVENTS
	nsCOMPtr<nsIAppShell> appShell(do_CreateInstance(kAppShellCID));
    NS_ENSURE_TRUE(appShell, NS_ERROR_FAILURE);
    appShell->Create(0, nsnull);
    appShell->Spinup();
#endif

	// set the sleeping flag, for wakeup() to eventually unset
	sleeping = PR_TRUE;

	PRIntervalTime epoch = PR_IntervalNow();
	PRIntervalTime interval = milliseconds * PR_TicksPerSecond() / 1000;
	if (verbose) printf("ChickenSleep: %u ticks per sec\n", PR_TicksPerSecond());
	if (verbose) printf("ChickenSleep: waiting for %u ticks\n", interval);

    rv = NS_OK;
    while (sleeping && NS_SUCCEEDED(rv)) {

#ifdef PUMP_XPCOM_EVENTS
      PLEvent* event = 0;
      do {
        rv = eventQueue->GetEvent(&event);
        if (NS_SUCCEEDED(rv) && event) {
          if (verbose) printf("ChickenSleep: XPCOM event is %p\n", event);
          eventQueue->HandleEvent(event);
        }
      } while (event);
#endif

#ifdef PUMP_NATIVE_EVENTS
      void* data;
      PRBool isRealEvent;
      rv = appShell->GetNativeEvent(isRealEvent, data);
      if(NS_SUCCEEDED(rv)) {
        appShell->DispatchNativeEvent(isRealEvent, data);
      }
#endif

#ifdef PUMP_GTK_EVENTS
      while (g_main_context_iteration(NULL, FALSE)) {
      }      
      PR_Sleep(10);
#endif

	  PRIntervalTime elapsed = (PRIntervalTime)(PR_IntervalNow() - epoch);
       if (elapsed > interval) sleeping = PR_FALSE;
	}

#ifdef PUMP_NATIVE_EVENTS
    appShell->Spindown();
#endif

    if (verbose) printf("ChickenSleep: leaving Sleep()\n");

	sleeping = PR_FALSE;

    return NS_OK;
}

/* void Wakeup (); */
NS_IMETHODIMP ChickenSleep::Wakeup() {
	if (verbose) printf("ChickenSleep: waking up\n");
	sleeping = PR_FALSE;
	return NS_OK;
}

/* attribute boolean verbose; */
NS_IMETHODIMP ChickenSleep::GetVerbose(PRBool *aVerbose) {
	*aVerbose = verbose;
	return NS_OK;
}

NS_IMETHODIMP ChickenSleep::SetVerbose(PRBool aVerbose) {
	verbose = aVerbose;
	return NS_OK;
}

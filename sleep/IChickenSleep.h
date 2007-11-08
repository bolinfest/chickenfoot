/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM IChickenSleep.idl
 */

#ifndef __gen_IChickenSleep_h__
#define __gen_IChickenSleep_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    IChickenSleep */
#define ICHICKENSLEEP_IID_STR "bcfd7d77-5db9-44b9-aeae-8d45c3da45e2"

#define ICHICKENSLEEP_IID \
  {0xbcfd7d77, 0x5db9, 0x44b9, \
    { 0xae, 0xae, 0x8d, 0x45, 0xc3, 0xda, 0x45, 0xe2 }}

class NS_NO_VTABLE IChickenSleep : public nsISupports {
 public: 

  NS_DEFINE_STATIC_IID_ACCESSOR(ICHICKENSLEEP_IID)

  /**
     Sleep for the given number of milliseconds, while keeping UI, network,
     and Javascript active.  May return sooner than the timeout if wakeup() 
	 is called on this object.  Different simultaneous sleep() calls may be 
	 in progress at once, but each call must use a different ChickenSleep object.
   */
  /* void sleep (in PRInt32 milliseconds); */
  NS_IMETHOD Sleep(PRInt32 milliseconds) = 0;

  /**
    Wake up a sleep() call currently in progress on this ChickenSleep object.
	The corresponding sleep() may not return immediately; in particular, if other
	ChickenSleep.sleep() calls have been made since this object's sleep was 
	originally called, then those other sleeps have to finish before this object's
	sleep can return, since all the calls are nested on a single stack.
  */
  /* void wakeup (); */
  NS_IMETHOD Wakeup(void) = 0;

  /**
    When verbose is true, debugging messages are printed to stdout.
   */
  /* attribute boolean verbose; */
  NS_IMETHOD GetVerbose(PRBool *aVerbose) = 0;
  NS_IMETHOD SetVerbose(PRBool aVerbose) = 0;

};

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_ICHICKENSLEEP \
  NS_IMETHOD Sleep(PRInt32 milliseconds); \
  NS_IMETHOD Wakeup(void); \
  NS_IMETHOD GetVerbose(PRBool *aVerbose); \
  NS_IMETHOD SetVerbose(PRBool aVerbose); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_ICHICKENSLEEP(_to) \
  NS_IMETHOD Sleep(PRInt32 milliseconds) { return _to Sleep(milliseconds); } \
  NS_IMETHOD Wakeup(void) { return _to Wakeup(); } \
  NS_IMETHOD GetVerbose(PRBool *aVerbose) { return _to GetVerbose(aVerbose); } \
  NS_IMETHOD SetVerbose(PRBool aVerbose) { return _to SetVerbose(aVerbose); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_ICHICKENSLEEP(_to) \
  NS_IMETHOD Sleep(PRInt32 milliseconds) { return !_to ? NS_ERROR_NULL_POINTER : _to->Sleep(milliseconds); } \
  NS_IMETHOD Wakeup(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Wakeup(); } \
  NS_IMETHOD GetVerbose(PRBool *aVerbose) { return !_to ? NS_ERROR_NULL_POINTER : _to->GetVerbose(aVerbose); } \
  NS_IMETHOD SetVerbose(PRBool aVerbose) { return !_to ? NS_ERROR_NULL_POINTER : _to->SetVerbose(aVerbose); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IChickenSleep
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_ICHICKENSLEEP

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IChickenSleep)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void sleep (in PRInt32 milliseconds); */
NS_IMETHODIMP _MYCLASS_::Sleep(PRInt32 milliseconds)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void wakeup (); */
NS_IMETHODIMP _MYCLASS_::Wakeup()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* attribute boolean verbose; */
NS_IMETHODIMP _MYCLASS_::GetVerbose(PRBool *aVerbose)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}
NS_IMETHODIMP _MYCLASS_::SetVerbose(PRBool aVerbose)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IChickenSleep_h__ */

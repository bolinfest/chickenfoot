/*
 *  (c) Copyright The SIMILE Project 2003-2005. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/*
 * Created on Nov 24, 2004
 * Created by dfhuynh
 */
package edu.mit.csail.simile.firefoxClassLoader;

import java.net.URL;
import java.security.CodeSource;
import java.security.Permission;
import java.security.PermissionCollection;
import java.security.Permissions;
import java.security.Policy;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

/**
 * Lets us grant a set of specified permissions to any URL in a set of specified
 * codesources.
 * 
 * @author dfhuynh
 */
public class URLSetPolicy extends Policy {
    static private class MyPermissions extends PermissionCollection {
        private static final long serialVersionUID = 602331721988458546L;
        Permissions m_permissions = new Permissions();

        /* (non-Javadoc)
         * @see java.security.PermissionCollection#add(java.security.Permission)
         */
        public void add(Permission permission) {
            m_permissions.add(permission);
        }

        /* (non-Javadoc)
         * @see java.security.PermissionCollection#implies(java.security.Permission)
         */
        public boolean implies(Permission permission) {
            return m_permissions.implies(permission);
        }

        /* (non-Javadoc)
         * @see java.security.PermissionCollection#elements()
         */
        public Enumeration<Permission> elements() {
            return m_permissions.elements();
        }
    }
    
    private MyPermissions   m_permissions = new MyPermissions();
    private Policy          m_outerPolicy;
    private Set<String>             m_urls = new HashSet<String>();

    /* (non-Javadoc)
     * @see java.security.Policy#refresh()
     */
    public void refresh() {
        if (m_outerPolicy != null) {
            m_outerPolicy.refresh();
        }
    }
    
    /* (non-Javadoc)
     * @see java.security.Policy#getPermissions(java.security.CodeSource)
     */
    public PermissionCollection getPermissions(CodeSource codesource) {
        PermissionCollection pc = m_outerPolicy != null ?
                m_outerPolicy.getPermissions(codesource) :
                new Permissions();
        
        URL url = codesource.getLocation();
        if (url != null) {
            String s = url.toExternalForm();
            if (m_urls.contains(s) || "file:".equals(s)) {
                Enumeration<Permission> e = m_permissions.elements();
                while (e.hasMoreElements()) {
                    pc.add(e.nextElement());
                }
            }
        }
        
        return pc;
    }
    
    /**
     * Sets the outer policy so that we can defer to it for code sources that
     * we are not told about.
     * 
     * @param policy
     */
    public void setOuterPolicy(Policy policy) {
        m_outerPolicy = policy;
    }
    
    public void addPermission(Permission permission) {
        m_permissions.add(permission);
    }
    
    public void addURL(URL url) {
        m_urls.add(url.toExternalForm());
    }
}

